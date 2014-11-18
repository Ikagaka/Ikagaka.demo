property - 実行可能なプロパティ
========================================

これはなにか
----------------------------------------

これは伺か用SHIORIサブシステムである美代(Miyo)の辞書フィルタプラグインです。

辞書で使われる(得にフィルタで使われる)任意のプロパティをプログラムコードとして扱える機能を提供します。

このフィルタは提供するメソッドを主に他のフィルタ内部で使うことを想定しています。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-property

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-property

含まれるフィルタ
----------------------------------------

### property_initialize

Miyoの初期化時に実行するフィルタです。

依存
----------------------------------------

このフィルタが依存するものはありません。

使用方法
----------------------------------------

機能を使用可能にするためMiyoの初期化時にproperty_initializeを実行します。

    _load:
    	filters: [..., property_initialize, ...]
    	argument:
    		property_initialize:
    			handlers:
    				- coffee
    				- jse
    				- js

引数にproperty_initialize.handlersを指定します。

property_initialize.handlersの配列に指定されたハンドラをこの順番の優先度で適用するという指定です。

property_initializeを実行した時点で、Miyoインスタンスに次のメソッドが追加されています。

### property(property_base, property_name, request, id, stash, pre_hook)

    var option = this.property(argument.my_filter, 'option', request, id, stash, pre_hook);

property_baseの下のproperty_nameプロパティを返します。

プロパティの後ろに.js等のハンドラ名がついている場合、そのハンドラに対応したプログラムコードとして実行された結果が返ります。

そのようなプロパティが複数ある場合はproperty_initializeで定義したハンドラの優先度に従って実行されます。

後ろに何もつかないプロパティはただの文字列として扱われます。

    _load:
    	filters: [..., property_initialize, ...]
    	argument:
    		property_initialize:
    			handlers:
    				- jse
    				- js
    OnTest:
    	filters: [my_filter]
    	argument:
    		my_filter:
    			option: 3
    			option.jse: this.variables.my_filter + 2
    			option.js: return this.variables.my_filter + 2
    
    # var option = this.property(argument.my_filter, 'option', request, id, stash);

この場合option.jseが実行された結果が返されます。

プロパティは一度目の呼び出し時に文字列からコードにコンパイルされ、以降はそのコードが実行されるので、option.jse等の値を実行中に書き換えることは結果が保証されず推奨されません。

これら.js等がついたコードはMiyoのインスタンスをthisとして引数request, id, stashとrequire(node.js)が渡されて実行されます。

### コードの定義

コードはYAMLに文字列として扱われますが、`:`等の文字が含まれているとYAMLパーサーが単純な文字列として扱ってくれない可能性があります。

なので可読性の観点も含め長いコードはブロック定義にするのが望ましいと思われます。

    option.coffee: -|
    	if stash?.id?
    		str = 'id = ' + stash.id
    	else
    		str = 'id = ' + id
    	return str

### pre_hook

pre_hookはこれらのオプションがコードとしてパースされる前の文字列を受け取って整形するための関数を渡します。
引数にプロパティ、request, id, stashが渡されて実行されるので、プロパティとして扱う文字列を返してください。

pre_hookにはハンドラ名をキーにした関数群のオブジェクトか、単一の関数、あるいは単一の関数にハンドラ名をキーにした関数群を定義したものを渡せます。

    _load:
    	filters: [..., property_initialize, ...]
    	argument:
    		property_initialize:
    			handlers:
    				- jse
    				- js
    OnTest:
    	filters: [my_filter]
    	argument:
    		my_filter:
    			option: shiori
    
    # var pre_hook = function(property, request, id, stash){return property + 'jk'};
    # var option = this.property(argument.my_filter, 'option', request, id, stash, pre_hook);
    # var option = this.property(argument.my_filter, 'option', request, id, stash, {plain: pre_hook});
    # var pre_hook_2 = function(property, request, id, stash){return 'dummy'};
    # pre_hook_2.plain = function(property, request, id, stash){return property + 'jk'};
    # var option = this.property(argument.my_filter, 'option', request, id, stash, pre_hook_2);
    # var pre_hook_3 = function(property, request, id, stash){return property + 'jk'};
    # pre_hook_3.js = function(property, request, id, stash){return 'dummy'};
    # var option = this.property(argument.my_filter, 'option', request, id, stash, pre_hook_3);

この場合全て'shiorijk'が返されます。

plainは特別なハンドラ名で、.js等がつかないものの場合に適用されます。

plainの場合はどんな値を返しても問題になりませんが、コードとして適用されるプロパティの場合は文法エラー等になる文字列を渡せばエラーとなりますので注意してください。

### has_property(property_base, property_name)

    var has_option = this.has_property(argument.my_filter, 'option');

property_baseの下のproperty_nameプロパティの存在確認をします。真偽値が返ります。

有効なハンドラの指定によって結果は変わります。

    _load:
    	filters: [..., property_initialize, ...]
    	argument:
    		property_initialize:
    			handlers:
    				- jse
    				- js
    OnTest:
    	filters: [my_filter]
    	argument:
    		my_filter:
    			option1: 3
    			option2.coffee: @variables.my_filter + 2
    			option3.js: return this.variables.my_filter + 2

この場合option1とoption3についてはtrue、option2についてはfalseとなります。

### compiled_property(property_base, compiled_property_name, request, id, stash)

コンパイル済みのプロパティを実行します。

内部的に使われます。

### set_compiled_property(property_base, compiled_property_name, compiled_property, compiled_handler_name)

コンパイル済みのプロパティを設定します。

内部的に使われます。

ハンドラ
----------------------------------------

組み込みのハンドラは以下の通りです。

### plain

文字列として評価します。

ハンドラを示す後ろの文字列がない場合にこれが使われます。

### js

JavaScriptのコードとして評価します。

単純に関数に包まれたコードとして実行されるので、適切にreturn文を入れてください。

### jse

JavaScriptの式として評価します。

コードの冒頭に`return `を付加して関数に包んだコードとして実行されるので、return文はいりませんが、必ず最初の式が返されます。

なので次のようなコードでも`;`のあとは実行されません。

    option.jse: id == 'OnTest'; return dummy;

### coffee

CoffeeScriptのコードとして評価します。

これを使用する場合はCoffeeScriptをインストールしておいてください。

ゴーストへのインストールはghost/masterをカレントディレクトリとして

    npm install coffee-script

でインストールできます。

CoffeeScriptではreturnか最後に評価された値が必ず返り値になるのでJavaScriptのようなjs,jseの違いは必要有りません。

ハンドラを自分で定義する
----------------------------------------

Miyoインスタンスのfilters.property_handlerにハンドラは定義されています。

自作のハンドラを定義する場合は、コンパイルハンドラと実行ハンドラを定義する必要があります。

プロパティが呼ばれる場合には、一度目の実行の場合コンパイルハンドラでプロパティの文字列がコンパイルされてキャッシュされた後、実行ハンドラに渡されます。
二度目以降はキャッシュを使って実行ハンドラのみが実行されます。

### コンパイルハンドラ

まずfilters.property_handlerにプロパティの後ろにつける文字列と同名のキーでコンパイルハンドラ関数を定義します。

仮にoption.myという文字列で実行させたいハンドラを定義する場合以下のようにします。

    this.filters.property_handler.my = function(property, request, id, stash){...};

thisはMiyoインスタンスです。

コンパイルハンドラ関数はMiyoインスタンスをthisとして実行され、プロパティの文字列とrequest, id, stashを受け取り、プロパティの実行可能オブジェクト等と実行ハンドラ名を返します。

    this.filters.property_handler.my = function(property, request, id, stash){
    	return [new Function(property, 'id'), 'compiled_my'];
    };

返されたプロパティと実行ハンドラ名はキャッシュされます。

### 実行ハンドラ

filters.property_handlerにコンパイルハンドラが返す名前と同名のキーで実行ハンドラ関数を定義します。

前述のmyハンドラに対応するハンドラを定義する場合以下のようにします。

    this.filters.property_handler.compiled_my = function(compiled_property, request, id, stash){...};

thisはMiyoインスタンスです。

実行ハンドラ関数はMiyoインスタンスをthisとして実行され、コンパイルされたプロパティとrequest, id, stashを受け取り、最終的なプロパティの値を返します。

    this.filters.property_handler.compiled_my = function(compiled_property, request, id, stash){
    	return compiled_property.call(this, id);
    };

### 注意

node.jsではモジュールのロード等にrequireがしばしば使われますが、requireはグローバルではないゆえに何もしなければFunctionオブジェクト内では参照できなくなります。
requireを出来るようにしたければFunctionにrequireを渡すことが必要です。
