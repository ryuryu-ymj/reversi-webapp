# オセロゲームを作ろう!!!

<https://ryuryu-ymj.github.io/reversi-webapp/>

## セットアップ

1. リポジトリをクローンしてくる

```
git clone https://github.com/ryuryu-ymj/reversi-webapp.git
cd reversi-webapp
```

2. とりあえず動かしてみる

```
npm install
npm run dev
```

3. 自分の開発ブランチを切る

```
git branch <ブランチ名>
git switch <ブランチ名>
```

ブランチ名は `dev-ハンドルネーム` とする

4. コードを編集し，作業が一段落したらコミット

```
git add -A
git commit -m "<コミットメッセージ>"
```

コミットは何回してもいい

5. 変更内容をリモートにプッシュ

```
git push -u origin <ブランチ名>
```

6. [Githubのプロジェクトページ](https://github.com/ryuryu-ymj/reversi-webapp) でプルリクエストを立てる

7. プルリクエストをマージする

## ２回目以降の編集の流れ

1. リモートのmainブランチをプルしてくる（ローカルのプロジェクトを最新の状態に更新する）

```
git switch main
git pull
```

2. 自分の開発ブランチにマージ（他人の変更内容を反映）

```
git switch <ブランチ名>
git merge main
```

3. コードを編集し，作業が一段落したらコミット

```
git add -A
git commit -m "<コミットメッセージ>"
```

4. 変更内容をリモートにプッシュ

```
git push
```

２回目以降は `git push` でいい

6. [Githubのプロジェクトページ](https://github.com/ryuryu-ymj/reversi-webapp) でプルリクエストを立てる

7. プルリクエストをマージする
