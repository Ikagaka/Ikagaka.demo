stash - セッションローカルな変数
========================================

これはなにか
----------------------------------------

これは伺か用SHIORIサブシステムである美代(Miyo)の辞書フィルタプラグインです。

フィルタで使うセッションローカルな変数stashを利用できます。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-stash

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-stash

含まれるフィルタ
----------------------------------------

### stash

stashを設定します。

依存
----------------------------------------

このフィルタは以下に依存します。

- [miyojs-filter-property](https://github.com/Narazaka/miyojs-filter-property.git)

propertyを読み込んだ上でproperty_initializeを一回実行した後で利用できます。

    _load:
    	filters: [..., property_initialize, ...]

使用方法
----------------------------------------

MiyoのYAML辞書ファイルのエントリにフィルタを追加します。

    OnTest:
    	filters: [..., stash]
    	argument:
    		stash:
    			foo: 1
    			bar.jse: 1 + 1

argument.stashにあるそれぞれの名前でstashに登録します。

propertyの機能でコードも実行できます。
