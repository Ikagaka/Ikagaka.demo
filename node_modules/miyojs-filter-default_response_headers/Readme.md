default_response_headers - filter for setting default_response_headers of Miyo
========================================

これはなにか
----------------------------------------

これは伺か用SHIORIサブシステムである美代(Miyo)の辞書フィルタプラグインです。

default_response_headersを任意に設定するためのフィルタです。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-default_response_headers

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-default_response_headers

含まれるフィルタ
----------------------------------------

### default_response_headers

default_response_headersを設定します。

依存
----------------------------------------

このフィルタが依存するものはありません。

使用方法
----------------------------------------

MiyoのYAML辞書ファイルのエントリにフィルタを追加します。

    _load:
    	filters: [..., default_response_headers, ...]
    	argument:
    		default_response_headers:
    			Charset: UTF-8

argument.default_response_headersのデータをdefault_response_headersに設定します。
