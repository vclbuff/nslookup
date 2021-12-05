# Usage

- アセット / リソースの作成

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

- S3へのSPAの配置

AWS CLI や マネジメントコンソールから`frontend/dist`フォルダ内の各ファイルを`spaBucket`へ格納したら完了です。
