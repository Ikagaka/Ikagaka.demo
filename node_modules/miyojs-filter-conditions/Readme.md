conditions - 条件分岐
========================================

これはなにか
----------------------------------------

これは伺か用SHIORIサブシステムである美代(Miyo)の辞書フィルタプラグインです。

いわゆるswitch文を提供します。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-conditions

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-conditions

含まれるフィルタ
----------------------------------------

### conditions

いわゆるswitch文を提供します。

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
    	filters: [conditions]
    	argument:
    		conditions:
    			-
    				when.jse: this.variables.hoge == 1
    				do:
    					- \h\s[0]hoge = 1\e
    					- \h\s[0]hoge = 1!\e
    			-
    				when.coffee: @variables.hoge == 2
    				do:
    					filters: [conditions]
    					argument:
    						...

argument.conditionsを使います。

conditionsは配列で、それぞれの要素のwhenを評価し、真ならdoをエントリ内容として実行します。

whenはpropertyフィルタによる効果でwhen.[handler]という名前にするとコードとして評価することが出来ます。

breakのいらないswitch文のように、要素は順番どおりに評価され、最初に真となった要素のみが使われます。

whenのない要素は常に真と評価されるので、switch文のdefaultのように使うことが出来ます。

do内はエントリのトップレベル(たとえばOnTest:の直下)と同じように実行されます。
なので通常の発話等をおいたり、さらにfilterをかけることも可能です。
