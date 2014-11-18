MiyoJSドキュメント
=======================

- [ルートドキュメント](../Readme.ja.md)

MiyoJSの標準的な動作
-----------------------

伺かの栞として利用される場合の動作を説明します。

### 起動

MiyoJSはゴースト起動時にSSPに読み込まれたSHIOLINK.dllからシェルを通じて起動されます。

起動時に辞書ファイルが配置されるディレクトリを渡されるので、それを読み込んでオブジェクトとしてメモリに保持します。
もし失敗したときは、起動に失敗しSSPが固まります。

この辞書はmiyoをMiyoのインスタンスとして、miyo.dictionaryで参照できます。

### 初期化

起動後はShiolinkJSを利用してSSP←→SHIOLINK.dll←→MiyoJSとSHIORI/3.0の通信が受け渡されます。

まずSHIORI load()に対応する呼び出しにより、辞書から特別な名前である_loadエントリを非同期に呼び出し、実行します。

このloadの動作をゴースト作者は完全に制御できるので、通常ここで初期化処理を行います。

### 栞としての動作

この後は終了する直前まで、SHIORI request()に対応する呼び出しと返答で栞は動作します。

SHIORI request()に対応する呼び出しと返答は以下のように行われます。

MiyoJSはrequest()呼び出しにより渡されたSHIORI/3.0 Requestメッセージを受け取ると、ShioriJKのパーサーによりShioriJK.Message.Requestオブジェクトにして扱います。

辞書からそのリクエストがもつID名(IDヘッダの文字列)のエントリを非同期に呼び出し、実行した返値からShioriJK.Message.Responseオブジェクトを生成します。

これは文字列化され、SHIORI/3.0 Responseメッセージとして返答とされます。

### 終了

終了時は、SHIORI unload()に対応する呼び出しにより、辞書から特別な名前である_unloadエントリを非同期に呼び出し、実行します。

このunloadの動作もゴースト作者は完全に制御できるので、通常ここで終了処理を行います。

その処理が終わると栞のプロセスを終了します。

非同期
-----------------------

__MiyoJSは「非同期」に動作します。__

これはMiyoのJavaScriptでの実装であるMiyoJSの特徴的な動作であり、JavaScriptでのあらゆる動作を簡単に記述できるようにするための対策です。

### 非同期とは

多くのプログラミング言語で標準的に記述される処理は「同期」な処理です。

これは簡単に言えば、関数を呼んだときに、その関数が何らかの処理を終えるまでそこで処理がストップするような動作をいいます。

一方「非同期」な処理とは、メインの流れが関数の内部の処理を待たずに次の処理に移行するような動作です。

この場合、その関数から値を得たいときは同期的な処理で通常使われる「返値」で得ることはできず、代わりの手段としてその関数に、得たい値を引数にとる別の関数を渡して処理します。

非同期な処理は一般的に、処理を並列に行うことで効率化を図ったり、停止しては困るプロセスの中で時間のかかる処理を行うときなどに使われます。

CPUによる処理の待ち時間より通信の待ち時間のオーダーが大きいWeb技術と密接にかかわるJavaScriptでは、この非同期処理はそのどちらの目的でも広く使われています。

なのでJavaScriptの機能やライブラリをフルに使いたい場合、この非同期対応は必須といえます。

### 何が非同期か

非同期処理は本質的には「呼んだ処理がどういう順番で完了するかわからない」ものです。
並列実行や裏での処理では明らかにそのほうが効率がいいので、当然の動作といえます。

しかしMiyoJSではそのような動作の要求はありません。
単にあらゆるライブラリ、あらゆるJavaScriptの機能を簡潔に扱えるためのお膳立てとしての非同期対応です。

なのでMiyoJSの動作は基本的には「実行した順番に完了」し、前の完了結果が次に渡されます。

__エントリを普通に記述し、普通に同期的に書かれたフィルタを使えば特別なことを気にする必要はありません。__

__フィルタで非同期な機能を使う場合にのみMiyoJSの非同期処理を意識する必要があります。__
この点については「[フィルタの利用と作成](miyojs_filter.ja.md)」の項をご覧ください。

### 非同期処理の実装方法「Promise」

非同期処理の良い記述方法として「Futureパターン」というものがあり、そのJavaScriptでの実装として「Promise」があります。
MiyoJSはこのPromiseを使って非同期処理を簡潔に記述できるようにしています。

Promiseは非同期処理を同期処理とよく似た形で記述できるツールです。
なので__ドキュメント中で「～を完了値とするPromiseオブジェクト」という記述が出てきますが、同期的な場合は単なるその値の返値と同じように処理が進むと思ってかまいません__。

エントリの呼び出しと実行
-----------------------

Miyoの最も主要な動作である「エントリ呼び出しと実行」について詳細に説明します。

起動時の「辞書読み込み」と、終了時の「プロセス終了」という例外的な動作を除いて、Miyoは全ての動作が「エントリの呼び出しと実行」です。

load()、unload()時は与えられる情報が少なく、返値が使われないという違いはありますが、それも「エントリの呼び出しと実行」に変わりありません。

request()時の「エントリ呼び出しと実行」が標準的なので、それを基準に説明します。

### 渡されたSHIORI/3.0 Requestをオブジェクトにする

まずrequest()呼び出しによってSHIOLINK.dllから渡されたSHIORI/3.0 Request文字列が、パーサにかけられ[ShioriJK.Message.Request](http://narazaka.github.io/shiorijk/doc/class/ShioriJK/Message.Request.html)オブジェクトとなります。

これは[ShioriJK.RequestLine](http://narazaka.github.io/shiorijk/doc/class/ShioriJK/RequestLine.html)と[ShioriJK.Headers.Request](http://narazaka.github.io/shiorijk/doc/class/ShioriJK/Headers.Request.html)を持ち、各種データの参照を容易とするものです。

    var method = request.request_line.method; // GET or NOTIFY
    var id = request.headers.get('ID'); // OnBoot etc.
    var reference0 = request.headers.get('Reference0');

このリクエストオブジェクトShioriJK.Message.Requestをmiyo.request()に渡します。

### リクエストが有効なら辞書処理を呼ぶ(request)

まずリクエストオブジェクトがSHIORI/3.0であることを確認し、そうでないなら400 BadRequestを生成してSHIORIのrequest()に返答します。

次にこのオブジェクトからIDヘッダを取得し、そのIDとShioriJK.Message.Requestを引数にとってmiyo.call_id()が呼ばれます。

### IDに対応する辞書エントリを選択する(call_id)

「辞書」(miyo.dictionaryに保持された連想配列)からID名のキー(たとえばmiyo.dictionary['OnBoot'])を捜します。

キーが存在しない場合は400 BadRequestを生成してSHIORIのrequest()に返答します。

キーが存在する場合はキーに対応する内容を「エントリ」とします。

    var entry = miyo.dictionary[id];

そしてID、ShioriJK.Message.Requestとこのエントリを引数にとってmiyo.call_entry()が呼ばれます。

### エントリの種別に対してそれぞれの処理を行い、単一値を得る(call_entry)

エントリに対して以下の試行をします。

1. エントリがスカラ(単一値)なら、その値をmiyo.call_value()に渡す。
2. エントリが配列なら、ランダム選択によりそのうち1要素を得る(call_list)。その値をエントリとして、再びmiyo.call_entry()を呼ぶ。
3. エントリが連想配列なら、エントリ内容をmiyo.call_filters()に渡す。

エントリが配列だった場合は、それが配列でなくなるまで再帰的にランダム選択されます。

つまりこのcall_entryでは最終的に、単一値がmiyo.call_value()に渡されるか、連想配列値がmiyo.call_filters()に渡されるかの2パターンになります。

miyo.call_value()に渡される単一値はたいていの場合単なるさくらスクリプト文字列か、またはリソース文字列です。

miyo.call_filters()に渡される連想配列値は、「フィルタ」の名前を列挙したfiltersキーと、最初のフィルタに渡す引数であるargumentキー(ない場合もある)をもつデータです。

miyo.call_value()は「Valueフィルタ処理」、miyo.call_filters()は「フィルタ処理」をそれぞれ渡された値に施して、Valueヘッダ文字列か、ShioriJK.Message.Responseオブジェクトを完了値とするPromiseオブジェクトを返します。

どちらにもエントリのほかにID、ShioriJK.Message.Requestも引数として渡されます。

この「Valueフィルタ処理」、「フィルタ処理」はゴースト制作者が完全に制御できる、Miyoの特徴の根幹です。

これらの詳細については後で説明します。

とりあえず、エントリの値に何らかの変換を施して、最終値を得るということです。

この最終値、Valueヘッダ文字列か、ShioriJK.Message.Responseオブジェクトを完了値とするPromiseオブジェクトをmiyo.request()に返します。

### SHIORI/3.0 Responseを生成する(request)

返されたPromiseオブジェクトからValueヘッダ文字列かShioriJK.Message.Responseオブジェクトを受け取って、前者の場合はその値を基にしてShioriJK.Message.Responseオブジェクトを生成します。

これを文字列化してSHIORI/3.0 Responseとし、それを完了値とするPromiseオブジェクトをSHIORIのrequest()に返答します。

もしここまでの過程のうちでエラーが生じていた場合、500 Internal Server Errorを同様にSHIORIのrequest()に返答します。

以上で「エントリの呼び出しと実行」の一連の流れが終了します。

エントリの呼び出しと実行(load()、unload()時)
-----------------------

load()、unload()時も中心的な流れは同一ですが、開始と終了に違いがあります。

### load()呼び出しの場合 渡されるディレクトリを格納する(load)

load()はゴーストのカレントディレクトリを表す1つの引数を伴っています。

これをmiyo.shiori_dll_directoryに保存します。

### 辞書処理を呼ぶ(load/unload)

loadの場合、IDを「_load」としてmiyo.call_id()が呼ばれます。

unloadの場合、IDを「_unload」としてmiyo.call_id()が呼ばれます。

リクエストオブジェクトは当然存在しないので、nullが渡されます。

### request()と同一の処理

この後はrequestと同一の処理が行われますが、返値は無視されます。

なので前述の説明のcall_entryの箇所までとなります。

### unload()呼び出しの場合 終了する(unload)

すべての処理が終わったら、process.exit()を呼び、プロセスを終了します。

フィルタ処理(call_filters)
-----------------------

### call_filters

miyo.call_filters()は、「フィルタ」の名前を列挙したfiltersキーと最初のフィルタに渡す引数であるargumentキー(ない場合もある)をもつ連想配列entry、リクエストオブジェクト、ID等を引数にとり、「フィルタ処理」を実行し、Valueヘッダ文字列かShioriJK.Message.Responseオブジェクトを完了値とするPromiseオブジェクトを返します。

    var value_or_response = miyo.call_filters(
    	{filters: ['filter_name_1', 'filter_name_2'], argument: argument},
    	request,
    	id
    );

これはmiyo.call_entry()でエントリが連想配列であった場合にまず呼ばれます。

### フィルタ処理

「フィルタ処理」は、filtersで指定された「フィルタ群」にargumentの値を渡し、返値としてValueヘッダ文字列かShioriJK.Message.Responseオブジェクト、またはそれを完了値とするPromiseオブジェクトを受け取る処理です。

「フィルタ処理」は以下の手順で行われます。

最初に後述するフィルタの種類チェックをして、適合しない場合エラーとなります。

また列挙された名前のフィルタが存在しない場合もエラーとなります。

これらをクリアした後、まずfiltersに指定された最初の名前の「フィルタ」にargumentの値を引数として渡して返値を得ます。

次に2番目の「フィルタ」があればこの返値を引数として渡して再び返値を得ます。
前の返値がPromiseオブジェクトならその完了値を引数として使います。

3番目以降も前の「フィルタ」の返値を次の「フィルタ関数」の引数にして、全ての「フィルタ」を実行し、最後の返値を最終的な「フィルタ処理」の完了値とします。

なお各「フィルタ」には利便のため上記の主引数と同時にリクエストオブジェクト、ID等も一緒に渡されています。

以下に例を挙げます。

    OnTest:
    	filters: [filter_1, filter_2]
    	argument:
    		filter_1: 111

上記の場合miyo.filters.filter_1、miyo.filters.filter_2が実行されます。

filter_1の引数はargumentの内容である{filter_1: 111}です。

filter_2の引数はfilter_1の返値です。

そしてOnTestエントリの返値はfilter_2の返値です。

### フィルタの実態

このように、Miyoにおいて「フィルタ」と呼ばれるものは、辞書から名前を指定して呼び出しできる単なる関数で、連想配列miyo.filtersに名前をキーとして登録されています。

フィルタの具体的な作成方法は「[フィルタの利用と作成](miyojs_filter.ja.md)」の項をご覧ください。

フィルタは形式的には単なる関数ですが、しかし名前の通り、ある規約内の入力値と出力値を持つことを要求されます。

### フィルタの入出力チェック

MiyoJSのフィルタ処理は、argumentを最初の入力データとして、最終的にValueヘッダ文字列かShioriJK.Message.Responseオブジェクトを生成する体系です。

なのでフィルタには次の種類のものが考えられます。

- 任意引数を受け取り、そのままを返値とするもの [throughフィルタ]
- データを引数として受け取り、データを返値とするもの [data-dataフィルタ]
- データを引数として受け取り、ValueヘッダかShioriJK.Message.Responseを返値とするもの [data-valueフィルタ]
- ValueヘッダかShioriJK.Message.Responseを受け取り、ValueヘッダかShioriJK.Message.Responseを返値とするもの [value-valueフィルタ]
- データまたはValueヘッダかShioriJK.Message.Responseを引数として受け取り、ValueヘッダかShioriJK.Message.Responseを返値とするもの [any-valueフィルタ]

このフィルタの種類により、簡易的な型システムのように、フィルタの組み合わせがチェックされます。

連鎖するフィルタは前のフィルタの返値と次のフィルタの引数の種類が同じでなければなりません。

例えば、data-dataからdata-valueにつなげることはできますが、data-dataからvalue-valueにつなげることはできません。

また最初のフィルタはdataを渡されるので、value-value以外が許可されます。
そして最後のフィルタはvalueを返す必要があるので、data-data以外が許可されます。

ただしthroughはどんな引数でもとれて、引数の種類を変換しないので、throughはないものとして考えた場合の連鎖が要求通りになっている必要があります。

またany-valueは前の引数の種類はdataでもvalueでもかまいません。

### フィルタの用途

これら色々な種類のフィルタが想定されますが、それぞれに想定される適した用途を述べておきます。

#### throughフィルタ

これは完全な「副作用」を目的とするフィルタです。

Miyoインスタンスの設定を変えたり、機能を追加したりする、あるいは外部のコマンドを呼び出す等の用途が考えられます。

また設定を必要とするフィルタのために変数等を初期化する用途に使われることもあるでしょう。

### data-dataフィルタ・data-valueフィルタ・any-valueフィルタ

条件によって引数や内容を加工する用途等が想定されます。

辞書内で条件分岐を記述したりするのが主な用途でしょう。

### value-valueフィルタ

後述のValueフィルタが最も主要な使い道でしょう。

Valueヘッダを変換する用途は、いわばOnTranslateのようなものです。

Valueフィルタ処理(call_value)
-----------------------

### call_value

miyo.call_value()は、Valueヘッダ文字列かShioriJK.Message.Responseオブジェクトであるvalue、リクエストオブジェクト、ID等を引数にとり、「Valueフィルタ処理」を実行し、Valueヘッダ文字列かShioriJK.Message.Responseオブジェクトを完了値とするPromiseオブジェクトを返します。

    var value_or_response = miyo.call_value(
    	'\\h\\s[0]\\e',
    	request,
    	id
    );

これはmiyo.call_entry()でエントリが単一値であった場合にまず呼ばれます。

### Valueフィルタ処理

「Valueフィルタ処理」は、miyo.value_filtersで指定された「フィルタ群」にvalueの値を渡し、返値としてValueヘッダ文字列かShioriJK.Message.Responseオブジェクト、またはそれを完了値とするPromiseオブジェクトを受け取る処理です。

これは「フィルタ処理」(call_filters)でエントリのfiltersキーをmiyo.value_filters、argumentキーをvalueとしたものと同一です。

なお同様に各「フィルタ」には利便のため上記の主引数と同時にリクエストオブジェクト、ID等も一緒に渡されています。

以下に例を挙げます。

    # miyo.value_filters = ['filter_1', 'filter_2']
    OnTest: \h\s[0]\e

上記の場合、OnTestはフィルタ呼び出しを明示的に含んでいないにもかかわらず、miyo.filters.filter_1、miyo.filters.filter_2が実行され、OnTestエントリの返値はfilter_2の返値となります。

### Valueフィルタの用途

グローバルにテンプレート等を導入したい場合はValueフィルタに指定するのが手っ取り早いでしょう。

また特定の語尾を付けるなどグローバルな変換機能等も想定されます。
