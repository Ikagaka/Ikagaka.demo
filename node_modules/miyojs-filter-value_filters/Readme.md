value_filters - value_filtersの管理
========================================

これはなにか
----------------------------------------

これは伺か用SHIORIサブシステムである美代(Miyo)の辞書フィルタプラグインです。

value_filtersの追加や削除を簡単化します。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-value_filter

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-value_filter

含まれるフィルタ
----------------------------------------

### set_value_filters

value_filtersをセットします。

### append_value_filters

新しいvalue_filtersを末尾に追加します。

### prepend_value_filters

新しいvalue_filtersを先頭に追加します。

### remove_value_filters

指定されたvalue_filtersを削除します。

依存
----------------------------------------

このフィルタが依存するものはありません。

使用方法
----------------------------------------

MiyoのYAML辞書ファイルのエントリにフィルタを追加します。

    _load:
    	filters: [..., set_value_filters, ...]
    	argument:
    		set_value_filters:
    			- talking

### set_value_filters

argument.set_value_filtersの内容をMiyoインスタンスのvalue_filtersにセットします。

filterの名前の配列を指定してください。

    // miyo.filters = ['pre']
    
    _load:
    	filters: [..., set_value_filters, ...]
    	argument:
    		set_value_filters:
    			- talking
    			- test
    
    // miyo.filters = ['talking', 'test']

### append_value_filters

argument.append_value_filtersに指定されたフィルタをMiyoインスタンスのvalue_filtersの末尾に追加します。

filterの名前の配列を指定してください。

    // miyo.filters = ['pre']
    
    _load:
    	filters: [..., append_value_filters, ...]
    	argument:
    		append_value_filters:
    			- talking
    			- test
    
    // miyo.filters = ['pre', 'talking', 'test']

### prepend_value_filters

argument.prepend_value_filtersに指定されたフィルタをMiyoインスタンスのvalue_filtersの先頭に追加します。

filterの名前の配列を指定してください。

    // miyo.filters = ['pre']
    
    _load:
    	filters: [..., prepend_value_filters, ...]
    	argument:
    		prepend_value_filters:
    			- talking
    			- test
    
    // miyo.filters = ['test', 'talking', 'pre']

### remove_value_filters

argument.remove_value_filtersの内容をMiyoインスタンスのvalue_filtersから削除します。

filterの名前の配列を指定してください。

    // miyo.filters = ['pre', 'talking', 'test']
    
    _load:
    	filters: [..., remove_value_filters, ...]
    	argument:
    		remove_value_filters:
    			- talking
    // miyo.filters = ['pre', 'test']
