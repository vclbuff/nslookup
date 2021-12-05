import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

import * as path from 'path';

export class NslookupStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const blockPublicAccess = new s3.BlockPublicAccess({
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true
    })

    const spaBucket = new s3.Bucket(
      this,
      'spaBucket',
      {
        blockPublicAccess
      }
    )

    const nslookupFunction = new lambda.Function(
      this,
      'nslookupFunction',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '..',
            'lambda',
            'nslookupFunction'
          )
        ),
        memorySize: 128
      }
    )

    const rest = new apigateway.RestApi(this, 'rest', {
      restApiName: 'nslookup'
    })
    const restApi = rest.root.addResource('api')
    const restApiV1 = restApi.addResource('v1')
    const restApiV1Nslookup = restApiV1.addResource('nslookup')
    restApiV1Nslookup.addMethod(
      'GET',
      new apigateway.LambdaIntegration(nslookupFunction)
    )

    const hostedZone = route53.HostedZone.fromLookup(this, 'hostedZone', {
      domainName: process.env.DEFAULT_DOMAIN_NAME ? process.env.DEFAULT_DOMAIN_NAME : '',
    })

    const certificate = new certificatemanager.DnsValidatedCertificate(
      this,
      'certificate',
      {
        domainName: process.env.FQDN ? process.env.FQDN : '',
        subjectAlternativeNames: [
          process.env.FQDN ? `*.${process.env.FQDN}` : '',
        ],
        hostedZone,
        region: 'us-east-1',
      }
    )

    const apiUrl = rest.url.split('/')[2]
    const apiBasePath = rest.url.split('/')[3]
    const oai = new cloudfront.OriginAccessIdentity(this, 'oai')
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'distribution',
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: spaBucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
              },
            ],
          },
          {
            customOriginSource: {
              domainName: apiUrl,
              originPath: `/${apiBasePath}`
            },
            behaviors: [
              {
                pathPattern: 'api/*',
                allowedMethods:
                cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                forwardedValues: {
                  queryString: true,
                },
              },
            ],
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          certificate,
          {
            aliases: [process.env.FQDN ? process.env.FQDN : ''],
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            sslMethod: cloudfront.SSLMethod.SNI,
          }
        ),
        errorConfigurations: [
          {
            errorCode: 404,
            errorCachingMinTtl: 60,
            responseCode: 200,
            responsePagePath: '/index.html',
          },
        ]
      }
    )

    const ARecord = new route53.ARecord(this, 'ARecord', {
      recordName: process.env.FQDN ? process.env.FQDN : '',
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    })
  }
}
