MiyoJSドキュメント
=======================

- [ルートドキュメント](../Readme.ja.md)

フィルタの利用と作成
-----------------------

### フィルタの形式

MiyoJSのフィルタはMiyoJSインスタンスmiyo上ではmiyo.filtersに名前で登録されている関数として存在します。

またMiyoJSフィルタはファイルシステム上には通常node.jsのモジュールとして存在します。

### 公開されているフィルタのインストール

node.jsのモジュールはnode.jsのパッケージ管理ツールnpmで管理することができます。

npmに登録されているMiyoJSのフィルタモジュールを探すには、[npm](http://npmjs.org/)で「miyojs-filter-」が先頭につくものを探すことで可能です。

インストールはゴーストのルートディレクトリをカレントディレクトリとして

    npm install miyojs-filter-foo

等を実行することで可能です。

npmに登録されていなくとも、Github等から直接インストールすることもできます。

詳しくはnpmのヘルプ等を参照してください。

### フィルタのロード

#### node.js上

MiyoJSは基本的にnode.jsの`require`を利用して、node.jsのフィルタモジュールをロードします。

フィルタのロードは自動では行われません。
Miyoで最初から利用可能な特別なフィルタ`miyo_require_filters`を利用して、辞書で明示的に指定して行います。

    _load:
    	filters: [miyo_require_filters]
    	argument:
    		miyo_require_filters:
    			- filter1
    			- ./filter2
    			- ./filter3.js

miyo_require_filtersはargument.miyo_require_filtersに指定されたフィルタ名のリストを使ってフィルタをロードするフィルタです。

このロードには次の規則があります。

フィルタ名の先頭にパスを示す「/」,「./」,「../」がつく場合、カレントディレクトリのパスと指定されたフィルタ名を連結したパスをrequireに渡します。

例えばカレントディレクトリが`Z:\path\to\ghost\master`だった場合は、`./filter2`は`Z:\path\to\ghost\master\filter2としてrequireされます。

カレントディレクトリは栞として動いている場合通常ゴーストのルートディレクトリです。

フィルタ名の先頭にそれらがつかない場合、「miyojs-filter-」と指定されたフィルタ名を連結した名前をrequireに渡します。

例えば`filter1`は`miyojs-filter-filter1`としてrequireされます。

基本的にこの読み込み時にフィルタ名の先頭にパスを示す文字列がつかない、パッケージとして整備された(した)フィルタを使うことを推奨します。

なぜなら、パッケージとして整備されることで再利用性が高まるのはもちろん、MiyoJSだけでない将来の他言語版Miyoと相互運用性がとれる可能性が高まるからです。

requireの動作に関しては[node.jsのドキュメント](http://nodejs.jp/nodejs.org_ja/api/modules.html)を参照することをお勧めしますが、標準的な使用法にあたるものを簡単に説明します。

`./filter3.js`から呼ばれるrequire('Z:\path\to\ghost\master\filter3.js')は絶対パスを含むので、そのパスにあるfilter3.jsファイルを読み込みます。

`./filter2`から呼ばれるrequire('Z:\path\to\ghost\master\filter2')は絶対パスを含むので、そのパスにあるfilter2が処理されます。

filter2がディレクトリだった場合、ディレクトリ形式のモジュール読み出しを試行します。
filter2/package.jsonがあればその記述に従い、なければfolder2/index.jsを読み込みます。

filter2がファイルであるか、filter2.jsファイルが存在する場合、そのファイルを読み込みます。

`filter1`から呼ばれるrequire('miyojs-filter-filter1')はパスを含まないので、node_modulesディレクトリからの読み込みプロセスとなります。

MiyoJSのライブラリがあるディレクトリから、順に親ディレクトリをたぐってゆきそれぞれに/node_modulesを付加したパスにmiyojs-filter-filter1がないか探します。

例えばMiyoJSのライブラリが`Z:\path\to\ghost\master\node_modules\miyojs`にある場合(標準的)、`Z:\path\to\ghost\master\node_modules\miyojs\node_modules\miyojs-filter-filter1`がないか探し、なければ`Z:\path\to\ghost\master\node_modules\node_modules\miyojs-filter-filter1`、`Z:\path\to\ghost\master\node_modules\miyojs-filter-filter1`、と順に探してゆきます。

見つかった段階で`./filter2`の場合と同じようにディレクトリ形式のモジュール読み出しかファイル形式のモジュール読み出しを行います。

npmからインストールしたモジュールは基本的にこの場合のディレクトリ形式のモジュール読み出しが使われます。

なぜなら前述の方法でnpmでインストールしたモジュールmiyojs-filter-filter1は`Z:\path\to\ghost\master\node_modules\miyojs-filter-filter1`に配置されるからです。

#### ブラウザ上

MiyoJSのフィルタは通常node.jsのモジュールとして読み込まれますが、MiyoJSはブラウザでも簡単に動作するように作られています。

なのでMiyoJSのフィルタもブラウザでも実行できるように用意すべきです。

ブラウザ上でのフィルタ読み込みは、requireが使えず、フィルタ名とファイル名の対応もつかないゆえに、以下のような挙動となります。
miyo_require_filtersはargument.miyo_require_filtersを無視し、連想配列変数MiyoFiltersに実行時に存在するフィルタ全てをフィルタとして読み込みます。

あらかじめ&lt;script&gt;等でフィルタのファイルを選択して読み込んでおき、そのあとでmiyo_require_filtersを実行すべきです。

### フィルタの作成

この項では、MiyoJSインスタンスに適切に登録できるMiyoJSフィルタの作成方法を説明します。

#### 雛形

MiyoJSのフィルタは前述のようにnode.jsのモジュールとしても動き、ブラウザ上でも動くべきです。

もしnode.jsに固有の機能を使う必要がある場合はnode.jsのモジュールとしてのみ、ブラウザ固有の機能を使う必要がある場合はブラウザ上のみを考えれば良いですが、一般的にはどちらでも動くよう以下の対応をとります。

node.jsとして動く場合、miyo_require_filtersはmodule.exportsでエクスポートされた連想配列に含まれる名前とフィルタ内容のペアをフィルタリストにコピーします。

またブラウザ上で動く場合、miyo_require_filtersは連想配列MiyoFiltersに含まれる名前とフィルタ内容のペアを同様にフィルタリストにコピーします。

よってフィルタのテンプレートとしては以下が推奨されます。

    (function() {
    	var MiyoFilters;
    	
    	if (this.MiyoFilters != null) {
    		MiyoFilters = this.MiyoFilters;
    	} else {
    		MiyoFilters = {};
    	}
    	
    	...
    	
    	MiyoFilters.foo_filter = {
    		type: '...',
    		filter: function(argument, request, id, stash){...}
    	};
    	
    	...
    	
    	if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    		module.exports = MiyoFilters;
    	} else {
    		this.MiyoFilters = MiyoFilters;
    	}
    
    }).call(this);

外側の関数はグローバルな名前の衝突を避けるJavaScriptの一般的な書き方です。

coffee-scriptで生成する場合は以下のようにしてください。

    if @MiyoFilters?
    	MiyoFilters = @MiyoFilters
    else
    	MiyoFilters = {}
    
    ...
    
    MiyoFilters.foo_filter = type: '...', filter: (argument, request, id, stash) ->
    	...
    
    ...
    
    if module?.exports?
    	module.exports = MiyoFilters
    else
    	@MiyoFilters = MiyoFilters

coffee-scriptではコンパイル時にデフォルトで外側の関数が作られます。

foo_filterがフィルタ名で、これが辞書内のfiltersに記述される名前となります。

foo-filter等JavaScriptで変数として扱われない名前を使いたい場合は

    MiyoFilters['foo-filter'] = ...

のようにしてください。

複数のフィルタを指定したい場合は単純にMiyoFiltersに複数のキーで指定してください。

#### フィルタの指定

さて、MiyoFilters.foo_filterは連想配列で、typeキーとfilterキーがあります。

typeキーにはフィルタの入出力タイプを指定します。

これは「フィルタ処理」中「フィルタの入出力チェック」の項にある

- through
- data-data
- data-value
- value-value
- any-value

のうちどれかを文字列で指定します。

dataは任意引数ですが、通常はフィルタ呼び出しエントリのargumentで指定される引数等を指します。

valueはValueヘッダ文字列かShioriJK.Message.Responseオブジェクトを指します。

anyはどちらもあり得ます。

詳細は「フィルタの入出力チェック」の項を参照してください。

valueは形式的にはdataの指す集合に含まれますが、フィルタ処理の出力値がvalueである必要があるため特別扱いされています。

これはあくまでフィルタの人手での組み合せをスムーズにするための完全な自己申告であり、入出力がvalueであるところに他の値を渡したり返したりしてもチェックされません。

filterキーにはフィルタの本体の関数を指定します。

#### フィルタ関数の引数

フィルタ関数は(argument, request, id, stash)を引数に持ちます。

- argumentはdataあるいはvalueである主引数です。
- requestは現在のセッションのリクエストオブジェクトです。
- idは現在のセッションのリクエストIDです(リクエストオブジェクトからも取得できます)。
- stashはstashです。

argumentと返値の扱いについて以下のポリシーを定めます。

フィルタは「フィルタ処理」の項にあるように、前のフィルタの返値を引数として実行されます。

なので、dataを入力値にするフィルタは、「[MiyoDictionary形式辞書](miyo_dictionary.ja.md)」の項にあるように、argumentを連想配列として扱い、その中のフィルタ名と同名のキーをオプションとして扱うことを強く推奨します。

また、valueを入力値にするフィルタは、argumentがValueヘッダ文字列かShioriJK.Message.Responseオブジェクトどちらであった場合も、そのうちのValueヘッダのみを変更する処理をすることを強く推奨します。

加えてvalue-valueフィルタは出力値を入力値の形式(Valueヘッダ文字列かShioriJK.Message.Responseオブジェクト)と同一にすることを強く推奨します。

4番目のstashとは、現在のセッションで保持されるデータです。
これはフィルタのみが使うデータで、任意のデータを保存できます。
最初は空のオブジェクト`{}`で初期化されています。

stashが何のためにあるかというと、主にフィルタ関数内部からcall_id()、call_entry()等を呼ぶ場合、argumentが呼ばれる新しいエントリのものとなるために、stashなしでは変数の受け渡しができないからです。

このstashを実現するため、

- call_id(id, request, stash)
- call_entry(entry, request, id, stash)
- call_list(entry, request, id, stash)

は全て最終引数に渡されたstashを保持し、次の処理に渡します。

また

- call_value(entry, request, id, stash)
- call_filters(entry, request, id, stash)

は、使用する各フィルタに引数としてstashを渡します。

このようにstashは1回の一連のフィルタ処理で同一のものが使われます。

なのでstashを使うフィルタが一連のフィルタの中に複数あった場合を想定し、辞書のargument指定と同じように、stashを連想配列として定義し、フィルタ名をキーとした変数の受け渡しを行うことを強く推奨します。

stashはフィルタ関数内部からこれらcall_*()を呼ぶときに指定されるもので、連鎖の必要はないので、stashを使わない関数では無視してかまいません。

stashはload(), unload(), request()から直接呼ばれたcall_value(), call_filters()では常に未定義です。

#### 非同期処理サポートとその副作用の注意

MiyoJSはPromiseによる非同期処理をサポートしています。

これによりload(), request(), unload()とcall_*()の各メソッドは全てPromiseを返値とします。

なのでこれらの処理結果を単純に返すのではなくフィルタ内で加工したい場合は、Promiseの手順に従って記述する必要が出ます。

    this.call_id(id, request, stash).then(
    	function(value){ // 非同期で実行された結果の値を処理する
    		...
    	}
    ).catch(
    	function(error){ // 非同期での実行が失敗した場合の例外処理(必要な場合)
    		...
    	}
    );

詳しくは[JavaScript Promises: There and back again - HTML5 Rocks](http://tutorials.html5rocks.com/ja/tutorials/es6/promises/)や[JavaScript Promiseの本](http://azu.github.io/promises-book/)の説明等を参照してください。

#### フィルタの返値

フィルタの返値は任意の値ですが、ここにPromiseオブジェクトを返した場合thenで解決されてその完了値が次のフィルタにわたります。

逐次的に非同期の処理をしたい場合はPromiseオブジェクト(またはThenableなオブジェクト)を返してください。

とくにそのような目的がないなら単に普通の値を返してかまいません。

2014年11月現在Promiseはnode.jsでは次期安定バージョンに搭載(開発版では現在でも使用可能)、ブラウザではInternet Explorerは次期バージョンで搭載、他Gecko、Blinkエンジンはすでに搭載しています。

以上、非対応環境がまだ無視できない程度存在するので、動作時の依存関係にPromiseを実装するライブラリを指定するのが無難です。

そのようなライブラリとしては、MiyoJSは[es6-promise](https://www.npmjs.org/package/es6-promise)(依存)と[bluebird](https://www.npmjs.org/package/bluebird)に対応しています。

自由なPromiseライブラリを使ってよいですが、上記は必要十分な機能を備えています。
とくにブラウザでの使用時に依存ライブラリを減らすためにこれらから選ぶのは賢明な施策でしょう。

それらライブラリを使ってフィルタを実装する場合は、以下のコードを冒頭のMiyoFilters定義のあたりに追加で書いておくとよいでしょう。

    var Promise;
    
    if (Promise == null) {
    	if (typeof require !== "undefined" && require !== null) {
    		try {
    			Promise = require('es6-promise').Promise;
    		} catch (_error) {
    			Promise = require('bluebird');
    		}
    	} else {
    		if (this.Promise != null) {
    			Promise = this.Promise;
    		} else if (this.ES6Promise != null) {
    			Promise = this.ES6Promise.Promise;
    		}
    	}
    }

coffee-scriptで生成する場合は以下のようにしてください。

    unless Promise?
    	if require?
    		try
    			Promise = require('es6-promise').Promise
    		catch
    			Promise = require('bluebird')
    	else
    		if @Promise?
    			Promise = @Promise
    		else if @ES6Promise?.Promise?
    			Promise = @ES6Promise.Promise

#### フィルタモジュールの作成

フィルタの内容を記述できたら、それをmiyo_require_filtersから読めるよう配置する必要があります。

特にmiyo_require_filtersからパスを示す「/」,「./」,「../」がつかない名前指定の形式で参照できることを強く推奨します。

つまり、ゴーストのルートディレクトリ下のnode_modulesディレクトリに、「miyojs-filter-foobar」の名前を使って配置します。

この名前は含まれる主なフィルタの名前と一致させることを推奨します。

あるいは例えばfoo_create, foo_get, foo_update, foo_deleteのようなフィルタを提供する場合に、fooという名前にすることも推奨します。

またその規則に従わずともかまいません。

ただし、少なくともnpmやGithub等を参照して、重複しない名前を付けるべきです。

「miyojs-filter-foobar」の名前で参照できる形式としては

- miyojs-filter-foobar.jsという単体のファイル
- miyojs-filter-foobarディレクトリ下のディレクトリ形式のモジュール

があります。

他のnode.jsモジュールとの混乱を避けるためディレクトリ形式のモジュールを推奨します。

またディレクトリ形式のモジュールではmiyojs-filter-foobarディレクトリ下にindex.jsを置けば一応動きますが、npmモジュール形式にすることを視野に入れてpackage.jsonを適切に記述することを推奨します。

モジュールはnpmモジュール形式にして他の人も使えるよう公開することも視野に入れてください。

公開して多くの人にフィードバックをもらうことで、ソフトウェアの品質は向上します。

最低限のnpmモジュールはfoo.jsとpackage.jsonを必要とします。

package.jsonはnpmに登録する情報を記述するJSONファイルです。
次のような内容になります。

    {
      "name": "miyojs-filter-foo",
      "version": "0.0.1",
      "main": "foo.js",
      "description": "foo - MiyoJS filter for foo",
      "keywords": ["miyojs", "miyojs-filter"],
      "license": "MIT",
      "dependencies": {
        "js-yaml": ">= 3.0.2",
        "es6-promise": "^2.0.0"
      },
      "devDependencies": {
        "coffee-script": ">= 1.8.0",
        "mocha": ">= 1.20.1",
        "chai": ">= 1.9.2",
        "chai-as-promised": ">= 4.1.1",
        "sinon": ">= 1.10.3",
        "istanbul": ">= 0.3.2",
        "miyojs": ">= 1.0.3",
        "miyojs-filter-property": ">= 1.0.0"
      },
      "readmeFilename": "Readme.md",
      "homepage": "http://www.example.com/foo/",
      "author": {
        "name": "bar",
        "url": "http://www.example.com/bar/"
      },
      "repository": {
        "type": "git",
        "url": "https://github.com/bar/miyojs-filter-foo.git"
      }
    }

- nameはnpmモジュール名で、miyojs-filter-*の形式にします。
- versionはバージョンで、x.x.xの形式に限定されます。
- mainはモジュールのメインのJavaScriptファイルです。
- (任意)descriptionは説明です。
- (任意)keywordsはキーワードの配列です。検索時に使われます。最低限"miyojs", "miyojs-filter"を指定しておくとよいでしょう。
- licenseはライセンスです。よく知られたオープンソースライセンスを使う場合は定められた略称で記述できます。
- dependenciesは依存するモジュールです。依存モジュールがない場合は省略できます。
- devDependenciesは開発時のみ依存するモジュールです。依存モジュールがない場合は省略できます。
- (任意)readmeFilenameはReadmeファイルの名前です。
- (任意)homepageはWebサイトです。
- (任意)authorは作者情報です。
- (任意)repositoryは開発時のリポジトリ情報です。

詳細は[package.jsonの説明](http://liberty-technology.biz/PublicItems/npm/package.json.html)等を参照ください。

他にソフトウェアテストを書くtestや、Readme.mdファイル等があるとよりよく標準的です。

MiyoJSのフィルタモジュールをnpmモジュール形式にする場合に注意してほしい点があります。

それは自作のフィルタが他のMiyoJSのフィルタモジュールの機能に依存する場合、それをpackage.jsonのdependenciesに書いてはいけない(意味がない)ということです。

npmはモジュールが依存するモジュールを、そのモジュールのディレクトリの中のnode_modulesに配置します。

しかしmiyo_require_filtersが使うrequireの仕様により、Miyoのインスタンスはその「モジュールが依存するモジュール」が配置されている、深い階層のnode_modulesを参照しません。

なのでMiyoJSのフィルタモジュールは個別にインストールしてもらう必要があります。

Readme等にその旨を書いてください。

開発時のテスト等の時はdevDependenciesを使って自動化することが可能です。

### フィルタ作成のTips

#### フィルタの機能

フィルタは出来るだけ「単機能」にすることを推奨します。

「単機能」というのは難しいですが、ようはある1つの目的に対して最低限の機能の切り分けをするということです。

[miyojs-filter-value](https://github.com/Narazaka/miyojs-filter-value.git)等は非常に単純ですが、たとえば色々な機能を持った[miyojs-filter-autotalks](https://github.com/Narazaka/miyojs-filter-autotalks.git)も、「AIトークをする」ということのみに注力していて、AIトークでも重要ですがそれ以外にも重要な「トークをかぶらないようにする」機能は別のフィルタで提供するようにしています。

目的を絞って利用しやすいフィルタの機能を心がけましょう。

#### フィルタ中でのrequire

node.jsのrequireは常にそれが記述されているファイルの位置を基準として実行されます。

なのでmiyo_require_filtersのrequireと同じ走査をするためにはmiyo_require_filtersと同様に

-フィルタ名の先頭にパスを示す「/」,「./」,「../」がつく場合、カレントディレクトリのパスと指定されたフィルタ名を連結したパスをrequireに渡す。
-フィルタ名の先頭にそれらがつかない場合、「miyojs-filter-」と指定されたフィルタ名を連結した名前をrequireに渡す。

の少なくとも前者のプロセスを踏む必要があります。

#### node.js・ブラウザ両対応

MiyoJSの動作環境に即してnode.js・ブラウザ両対応するとき、ライブラリの使用法を工夫する必要があります。

一般的にnode.jsはrequireを使う一方、ブラウザでは&lt;script&gt;タグであらかじめ読み込まれたライブラリデフォルトの名前の変数を使います。

ここから下記のようなコードが求められます。

    var ShioriJK;
    if (typeof require !== "undefined" && require !== null) {
    	ShioriJK = require('shiorijk');
    }else{
		ShioriJK = this.ShioriJK;
	}
    
    var shiorijk = new ShioriJK();
    ...

coffee-scriptで生成する場合は以下

    if require
    	ShioriJK = require 'shiorijk'
	else
		ShioriJK = @ShioriJK
    
    shiorijk = new ShioriJK()
    ...

ブラウザ用にrequireの存在確認をし、ブラウザでも使用できるライブラリのブラウザ上でのデフォルト変数と同じになるようにrequireの対象を調整すれば、両対応が可能になります。
