MiyoJSドキュメント
=======================

- [ルートドキュメント](../Readme.ja.md)

MiyoJSリファレンス
-----------------------

以下の記述は次を前提とします。

    var Miyo = require('miyojs');

### コンストラクタ

    var miyo = new Miyo(dictionary)

dictionaryはdictionary属性に代入されます。

### 属性

#### shiori_dll_directory

ベースウェアからload時に渡されるSHIORI.dllのbasedir

これは`load()`が呼ばれた以降に存在します。

#### dictionary

__辞書__のデータ

イベント名とエントリ内容のペアである連想配列としてのオブジェクトです。

#### filters

__フィルタ__のデータ

フィルタ名とフィルタ関数のペアである連想配列としてのオブジェクトです。

#### value_filters

__Valueフィルタ__の名前リスト

Valueフィルタとして使用するフィルタを渡す順に列挙します。

#### default_response_headers

`make_value()`等のSHIORIレスポンスメッセージ自動生成で利用されるデフォルトのヘッダ

ヘッダ名とヘッダ内容のペアである連想配列としてのオブジェクトです。

`Charset: UTF-8`やSender等を登録しておくと便利です。

### メソッド

#### load(directory)

    miyo.load('C:/path/to/shiori/dll')

directoryはベースウェアからload時に渡されるSHIORI.dllのbasedirです。

辞書中の`_load`エントリを呼びます。

処理が終わってからPromiseオブジェクトを返します。

#### request(request)

    var response = miyo.request(request)

requestはShioriJK.Message.Requestです。

responseとしてSHIORI/3.0 Response文字列を完了値とするPromiseオブジェクトを返します。

requestとresponseを対応付ける処理は__辞書__にゆだねられます。

#### unload()

    miyo.unload()

可能なら`process.exit()`します。

処理が終わってからPromiseオブジェクトを返します。

#### call_id(id, request, stash)

    var response = miyo.call_id('OnBoot', request)

渡されたIDに対応するエントリを適切に処理し、結果を返します。

miyo.dictionaryからidに対応するエントリを探し、

    var response = miyo.call_entry(entry, request, id, stash)

を実行し、その返値を完了値とするPromiseオブジェクトを返します。

もしrequestがnullの場合(load()またはunload()を表す)、entryが空なら何も呼ばずに終了します。

#### call_entry(entry, request, id, stash)

    var response = miyo.call_entry('http://www.example.com/', request, 'homeurl', stash)

渡されたエントリを種類によって適切に処理し、結果を返します。

- entryが配列ならmiyo.call_list(entry, request, id, stash)
- entryが連想配列ならmiyo.call_filters(entry, request, id, stash)
- entryがスカラならmiyo.call_value(entry, request, id, stash)
- entryが空ならmiyo.call_not_found()

それぞれを呼んで、その返値を完了値とするPromiseオブジェクトを返します。

#### call_value(entry, request, id, stash)

    var response = miyo.call_value('http://www.example.com/', request, 'homeurl', stash)

渡された値を「Valueフィルタ処理」にかけ、結果を完了値とするPromiseオブジェクトを返します。

#### call_list(entry, request, id, stash)

    var response = miyo.call_list(['\\h\\s[0]おはよう\\e', '\\h\\s[0]おはこんばんちは\\e'], request, 'OnBoot', stash)

複数あるエントリ候補をランダムに選び、そのエントリを適切に処理し、結果を返します。

渡された配列要素のうち1つをランダムに選び、それをmiyo.call_entry()に渡し、結果を完了値とするPromiseオブジェクトを返します。

#### call_filters(entry, request, id, stash)

    var response = miyo.call_filters({
    	filters: ['filter_1', 'filter_2'],
    	argument: {
    		filter_1: {option: 1},
    		filter_2: 128
    	},
    }, request, 'OnTest', stash)

渡された値を「フィルタ処理」にかけ、結果を完了値とするPromiseオブジェクトを返します。

#### call_not_found(entry, request, id, stash)

    var response = miyo.call_not_found()

エントリがなかった場合に呼ばれる用途です。

miyo.make_bad_request()を呼び、その返値を完了値とするPromiseオブジェクトを返します。

#### build_response()

    var response = miyo.build_response()

空のShioriJK.Message.Responseオブジェクトを生成し返します。

#### make_value(value, request)

    var response = miyo.make_value('miyo', request)

200 OKまたは204 No Content(valueが空の場合)を生成し返します。

Valueヘッダにvalueを記述します。改行文字が含まれていた場合は「\r」、「\n」の文字列に変換されます。

requestは現在使われていませんが、SHIORI/3.0以外を扱うことが可能になった場合、リクエストのSHIORIバージョンと同じレスポンスを返すために使うことを想定して、引数としてあります。

#### make_bad_request(request)

    var response = miyo.make_bad_request(request)

400 Bad Requestを生成し返します。

#### make_internal_server_error(error, request)

    var response = miyo.make_internal_server_error('undefined value called', request)

500 Internal Server Errorを生成し返します。

X-Miyo-Errorヘッダにerrorを記述します。改行文字が含まれていた場合は「\r」、「\n」の文字列に変換されます。

### 静的属性

#### filter_types

    var filter_io_types = Miyo.filter_types.through

フィルタの種類名と入出力の種類の対応表です。

### 静的関数

#### DictionaryLoader.load_recursive(directory)

    var dictionary = Miyo.DictionaryLoader.load_recursive('./dictionaries')

指定されたディレクトリ下のすべてのファイルをMiyoDictionary形式の辞書として読み込み、オブジェクトとして返します。

ディレクトリは再帰的に辿られるので、深いディレクトリに辞書を置くことも可能です。

読み込み時の挙動は「辞書」の中「辞書の読み込み」の項をご覧ください。

#### DictionaryLoader.load(file)

    var dictionary = Miyo.DictionaryLoader.load('./dictionaries/default.yaml')

指定されたファイルをMiyoDictionary形式の辞書として読み込み、オブジェクトとして返します。

#### DictionaryLoader.merge_dictionary(source, destination)

複数のファイルから読み込まれた辞書をマージします。

内部的に使われます。
