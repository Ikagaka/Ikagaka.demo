MiyoJS - SHIORIサブシステム「美代」 for JavaScript
===============================================

Miyo(美代)とは
-----------------------

Miyo(美代)は伺か用のSHIORI(栞)サブシステムです。

標準でYAMLによる簡潔で記述し易い辞書形式MiyoDictionaryを用いつつ、フィルタによりあらゆるプログラムコードの実行をサポートします。

MiyoJSとは
-----------------------

Miyoの仕様を満たしたJavaScriptによる栞の実装です。

今のところ唯一の実装ですが、今後他言語版も作るかどうかは未定です。

以下で「Miyo」と記述してあるところはMiyo一般のことであり、JavaScript版であるMiyoJS特有のことではないということを示しています。
MiyoはMiyoJSに読み替えることが可能です。

コンセプト
-----------------------

新しい栞には新しいコンセプトが必要です。

Miyoは汎用言語の採用および簡潔かつ一貫した機能と徹底した役割分離により、プログラミング的に保守性の高いゴースト作成ができるSHIORIを目指しています。

Miyoが本質的にサポートするのは素のSHIORIプロトコルとの変換と辞書の制御程度の非常に限定的な部分です。

SHIORIサブシステムのrequestをSHIORI/3.0 ID別に分けて呼び出すことを基本としますが、普通干渉しないload、unloadをも制御できます。
一貫した動作を目指すことにより、多くのSHIORIサブシステムが内部で勝手に返すID: version等も全て辞書にゆだねられています。

さらに辞書から任意引数を渡せるフィルタ関数をサポートし、処理とデータを分離しつつ自由な処理ができる構造になっています。
これによってMiyoが辞書の枠組みに特化した基本的な機能のみを提供しつつ、その他の様々な機能は個別のフィルタとして随時選んで追加することが可能となり、透明性とメンテナンス性の高いゴースト制作が可能となります。

名前について
-----------------------

伺かのSHIORIサブシステムには伝統的に女性名をあてるので、拙作の漫画のキャラクターから名前を取り美代(みよ)と名づけました。

使用方法
-----------------------

### 栞として

ここではゴーストに組み込んで使用する方法を示します。

`/ghost/master`ディレクトリをカレントとして

    npm install miyojs

を実行します。

次に、[node.js](http://nodejs.org/)実行環境のnode.exeを適当な場所に配置します。

さらに[SHIOLINK](https://code.google.com/p/shiori-basic/downloads/)を入手し、SHIOLINK.dllとSHIOLINK.iniを`/ghost/master`ディレクトリに配置します。

そしてSHIOLINK.iniを編集し、

    commandline = path\to\node.exe .\node_modules\miyojs\bin\miyo-shiolink.js path\to\dictionaries

と設定します。

`path\to\dictionaries`はMiyoDictionary辞書ファイルを配置するディレクトリです。

この部分はアーカイブ済みサンプルゴーストを使うことでスキップできます。

### ライブラリとしてのインストール

    npm install miyojs

ライブラリとしての使用方法は後述の__MiyoJSリファレンス__を参照してください。

サンプルゴースト
-----------------------

ゴーストの機能プレビュー兼テンプレート代替として、サンプルゴースト[MiyoPreview](http://narazaka.net/c/ukagaka/)を公開しています。

依存関係
-----------------------

SHIORIプロトコルの処理に[ShioriJK](https://github.com/Narazaka/shiorijk.git)、SHIOLINKインターフェースに[ShiolinkJS](https://github.com/Narazaka/shiolinkjs.git)、YAML形式の辞書の読み込みに[js-yaml](https://github.com/nodeca/js-yaml.git)を利用しています。

ドキュメント
-----------------------

- [MiyoJSの動作全般について](doc/miyojs_flow.ja.md)
- [MiyoDictionary形式辞書](doc/miyo_dictionary.ja.md)
- [フィルタの利用と作成](doc/miyojs_filter.ja.md)
- [MiyoJSリファレンス](doc/miyojs_reference.ja.md)

関連リソース
-----------------------

公開されたフィルタの一覧は[miyojs-filters](https://github.com/Narazaka/miyojs-filters/wiki)にまとまっています。

ライセンス
--------------------------

[MITライセンス](http://narazaka.net/license/MIT?2014)の元で配布いたします。
