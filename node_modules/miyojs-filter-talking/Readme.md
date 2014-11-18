talking - ただいま発話中
========================================

これはなにか
----------------------------------------

これはJavaScriptによる伺か用SHIORIサブシステムの実装である美代(miyoshiori)の辞書フィルタプラグインです。

発話状態を検知するためのフィルタです。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-talking

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-talking

含まれるフィルタ
----------------------------------------

### talking

発話状態を検知するフィルタです。

argumentをvalueとして扱い、必要なイベントを付加した後のvalueを返します。

通常value_filterとして使います。

依存
----------------------------------------

このフィルタは以下に依存します。

- [miyojs-filter-variables](https://github.com/Narazaka/miyojs-filter-variables.git)

使用方法
----------------------------------------

Miyoの辞書ファイルでフィルタを読み込み、talking_initializeを実行します。

またvalue_filtersに登録します。

    _load:
    	filters: [..., append_value_filters, talking_initialize, ...]
    	argument:
    		talking_initialize:
    			timeout: 30
    		append_value_filters:
    			- talking

### talking_initialize

talking_initializeはargument.talking_initialize.timeoutをタイムアウト秒数として設定します。デフォルトは25秒です。デフォルトは変更される可能性があるので設定することをおすすめします。

このタイムアウト時間はバルーンがユーザーに閉じられた場合等に発話終了イベントが発生しないので、発話終了イベントが発生しない場合に発話中フラグをリセットするために設定されます。

この値を0にすることでタイムアウトの発生を抑止できます。

ベースウェアの機能でOnBalloonBreak、OnBalloonClose等が発生する場合は、OnBalloonBreak、OnBalloonClose等に\![raise,OnTalkingFilterTalkEnd]を設定し、この値を0にすることで、タイムアウトに頼らずにバルーンが閉じられた場合に対処できます。

### 動作

talking_initializeを実行した後value_filtersに登録されると、全ての発話の先頭と末尾に\![raise]を付加してイベントを発生させることでリアルタイムな発話状態を検知します。

このフィルタはMiyoインスタンスの辞書にOnTalkingFilterTalkBeginとOnTalkingFilterTalkEndエントリを追加するので、これらの名前を使用しないでください。

### 発話中フラグ variables_temporary.talking

Miyoインスタンスのvariables_temporary.talkingに発話中フラグがセットされます。
発話中はtrue、それ以外はfalseです。
