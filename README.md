# Usage

詳細はこちら [AWS CDKv2でnslookupウェブアプリを作る](https://abillyz.com/vclbuff/studies/59)

- 環境変数を設定する

- アセット / リソースを作成する

```bash
git clone https://github.com/vclbuff/nslookup.git
cd nslookup
npm install
cd frontend
npm install
npm run generate
cd ../
cdk deploy
```

- S3へSPAを配置する

AWS CLI や マネジメントコンソールから`frontend/dist`フォルダ内の各ファイルを`spaBucket`へ格納したら完了です。
