stash_template - stashテンプレート
========================================

これはなにか
----------------------------------------

これは伺か用SHIORIサブシステムである美代(Miyo)の辞書フィルタプラグインです。

stashから変数参照を行えるテンプレートを提供します。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-stash_template

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-stash_template

含まれるフィルタ
----------------------------------------

### stash_template

テンプレートを処理するフィルタです。

argumentをvalueとして扱い、テンプレートを処理した後のvalueを返します。

通常Valueフィルタとして使います。

依存
----------------------------------------

このフィルタが依存するものはありません。

使用方法
----------------------------------------

Valueフィルタとして使用する場合は、以下のようにvalue_filtersに登録します。

    _load:
    	filters: [..., append_value_filters, ...]
    	argument:
    		append_value_filters:
    			- stash_template

これで全てのValueを返すエントリの結果はテンプレート処理されます。

また単体で逐一使いたい場合はMiyoのYAML辞書ファイルのエントリにフィルタを追加します。

Valueを返すフィルタの後に指定する必要があります。

    OnAITalk:
    	filters: [value, stash_template]
    	argument:
    		value: \h\s[0]あああ#{aaa}\e

テンプレート
----------------------------------------

このフィルタを通った文字列は以下の置換を施されます。

### #{...}

\#{hoge}はstash.stash_template.hogeの中身に置換されます。

stashへの登録はフィルタ内で行うか、[miyojs-filter-stash](https://github.com/Narazaka/miyojs-filter-stash.git)等を使って

    OnTest:
    	filters: [stash, value]
    	argument:
    		stash:
    			stash_template.jse: |
    				{
    					"sakura": "さくら",
    					"unyu": "うにゅう"
    				}
    		value: |
    			\h\s[0]#{sakura}と#{unyu}\e

などとしてください。
