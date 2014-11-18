variables - 変数バンク
========================================

これはなにか
----------------------------------------

これは伺か用SHIORIサブシステムである美代(Miyo)の辞書フィルタプラグインです。

栞で使う変数を管理するための名前と機能を提供します。

インストール
----------------------------------------

### 一般

    npm install miyojs-filter-variables

### ゴーストに追加する場合

ghost/masterをカレントディレクトリとして同様に

    npm install miyojs-filter-variables

含まれるフィルタ
----------------------------------------

### variables_initialize

初期化のためのフィルタです。

### variables_load

変数を読込みます。

### variables_save

変数を保存します。

### variables_set

変数をセットします。

### variables_delete

変数を削除します。

### variables_temporary_set

一時変数をセットします。

### variables_temporary_delete

一時変数を削除します。

依存
----------------------------------------

このフィルタは以下に依存します。

- [miyojs-filter-property](https://github.com/Narazaka/miyojs-filter-property.git)

propertyを読み込んだ上でproperty_initializeを一回実行した後で利用できます。

    _load:
    	filters: [..., property_initialize, ...]

使用方法
----------------------------------------

### 初期化

Miyoの辞書ファイルのエントリにvariables_initializeフィルタを追加します。

    _load:
    	filters: [..., variables_initialize, ...]
    	argument:
    		...

このフィルタの全機能はvariables_initializeを実行した後に利用できます。

### variables

Miyoのインスタンスにvariablesプロパティがセットされます。

variablesは単なるオブジェクトで、連想配列のように使って変数を格納できます。

    miyo.variables.hoge = 'piyo';

variablesはvariables_save、variables_loadで保存、復帰することを前提とした永続的な変数を保存する目的で使用します。

### variables_temporary

Miyoのインスタンスにvariables_temporaryプロパティがセットされます。

variables_temporaryは単なるオブジェクトで、連想配列のように使って変数を格納できます。

    miyo.variables_temporary.hoge = 'piyo';

variables_temporaryは保存、復帰を前提としない実行時変数を保存する目的で使用します。

メソッド・フィルタ
----------------------------------------

### variables_save

Miyoのインスタンスにvariables_saveメソッドが追加されます。

またフィルタからも同機能を呼ぶことが出来ます。

variables_saveはfileでファイル名を引数に取り、そのファイルへ変数を保存します。

errorプロパティは任意で、書き込みに失敗したときの処理を記述します。
例外を吐く場合以外はerrorに指定される関数はstash.argumentをそのまま返してください。

    miyo.variables_save('./variables.save');
    
    OnSave:
    	filters: [variables_save]
    	argument:
    		variables_save:
				file: ./variables.save
				error.js: |
					...

### variables_load

Miyoのインスタンスにvariables_loadメソッドが追加されます。

またフィルタからも同機能を呼ぶことが出来ます。

variables_loadはfileでファイル名を引数に取り、そのファイルから変数をロードします。

errorプロパティは任意で、読み込みに失敗したときの処理を記述します。
例外を吐く場合以外はerrorに指定される関数はstash.argumentをそのまま返してください。

variables_saveでセーブされたファイルを扱えます。

    miyo.variables_load('./variables.save');
    
    OnSave:
    	filters: [variables_load]
    	argument:
    		variables_load:
				file: ./variables.save
				error.js: |
					...

### variables_set

フィルタから変数を設定できます。

variables_setは指定された名前の変数をvariablesに設定します。

propertyフィルタの機能によりコードも設定できます。

    OnSet:
    	filters: [variables_set]
    	argument:
    		variables_set:
    			foo: foobar
    			hoge.jse: 1 + 1

### variables_delete

フィルタから変数を削除できます。

variables_deleteは指定された名前の変数をvariablesから削除します。

    OnDelete:
    	filters: [variables_delete]
    	argument:
    		variables_delete:
    			- foo
    			- hoge

### variables_temporary_set

variables_setのvariables_temporary版です。

### variables_temporary_delete

variables_deleteのvariables_temporary版です。
