MiyoJSドキュメント
=======================

- [ルートドキュメント](../Readme.ja.md)

MiyoDictionary形式辞書
-----------------------

Miyoは辞書形式MiyoDictionaryを使用します。

MiyoDictionaryは形式的には、インデントにタブ文字を許した(混在は未定義です)YAMLです。

Miyo仕様の栞内部で扱う分には、配列と連想配列が階層的に使用でき、文字列を保存できるというだけの条件をもったいかなる形式でもかまいません。
ですが、形式的な仕様を制限することで、相互運用性が高まります。

### 構成

    OnBoot: \h\s[0]起動。\e
    OnFirstBoot: |
    	\h\s[0]初回起動。\w9\w9
    	\n
    	\n[half]
    	\s[8]かな？
    	\e
    
    OnClose:
    	- \h\s[0]終了。\e
    	- \h\s[0]終了かな？かな？\e
    	- |
    		\h\s[0]終わる世界と……\w9\w9
    		\s[2]なんだろう？
    		\e
    
    OnGhostChanging:
    	filters: [conditions]
    	argument:
    		conditions:
    			-
    				when.jse: |
    					request.headers.get('Reference0') == 'さくら'
    				do: |
    					\h\s[0]さくらだもん。\w9\w9
    					\n
    					\n[half]
    					\s[6]……ごめん。
    					\e
    			-
    				do:
    					- \h\s[0]変わるよ。\e
    					- \h\s[0]カワルミライ。\e

繰り返しますが、MiyoDictionaryはインデントにタブ文字を許したYAMLです。

さくらスクリプトは普通はエスケープをすることなく完全にYAMLのリテラルとして有効です。

一方で辞書内に少量の制御用プログラムコードを書く場合に出てくる「:」などが1行記述だとリテラルとして認識されない場合があります。

そのような場合はYAMLのブロック記述を利用すると、それらの値もリテラルとして扱われます。

長いさくらスクリプトやプログラムコードは、YAMLのブロック記述を利用して複数行記述をすると良いでしょう。

また以下のような数値として解釈できる値には注意が必要です。

    version: 1.0

MiyoDictionaryはYAMLとして解釈されるので、これは数値の1として解釈され、違う表現で文字列化されてしまうでしょう。

この場合にもブロック記述は有効です。また""で囲ってもいいでしょう。

    version: |
    	1.0
    
    version: "1.0"

### エントリの種類(単一値・配列値・連想配列値)

上記の例を見てみましょう。

基本的に辞書にはSHIORI/3.0 Event名をトップレベルにした連想配列を記述します。

OnBootとOnFirstBootは__単一値__エントリ(トップレベルの連想配列キーに対応する内容)です。

OnFirstBootはYAMLのブロック記述を使っています。

OnCloseは__配列値__エントリです。

3番目の値が同様にYAMLのブロック記述を使っています。

OnGhostChangingは__連想配列値__エントリです。

MiyoDictionaryで有効な連想配列値の中のキーは、filtersキー(必須)とargument(なくても良い)のみです。
filtersキーには配列または単一値、argumentには任意の値が許可されます。

このように、MiyoDictionaryでは3種類の値を扱います。

### 単一値・配列値のエントリ

単一値のエントリは、そこに記述されている値がSHIORI/3.0 ResponseのValue値の生成元としてそのまま使われます。

配列値のエントリは、配列中からランダムに1つ選ばれた値が単一値として同じように使われます。

ここでSHIORI/3.0 ResponseのValue値の生成元として選ばれた値は、MiyoのValueフィルタ機能で加工されます(Valueフィルタがなければ何もされない)。

YAMLの仕様ではブロック記述内での改行は保持されます。ですが、MiyoDictionaryでフィルタの処理を受けない値は通常この素の改行を無視して使われます。

ただし、Valueフィルタが素の改行を無視しない扱いをして結果を加工することもありえます。
ですが、デバッグ等の特別な理由がない限り、Valueフィルタもこの素の改行を無視するポリシーに従うべきです。

### 連想配列値のエントリ

連想配列値のエントリは、filtersキーに指定されたフィルタ関数をargumentキーの内容を引数として呼び出し、その返り値をSHIORI/3.0 Responseの生成元として使います。

返り値が単なる文字列等ならValue値として、SHIORI/3.0 Responseを表すオブジェクトならそのまま使われます。

    OnGhostChanging:
    	filters: conditions
    	argument:
    		conditions:
    			-
    				when.jse: |
    					request.headers.get('Reference0') == 'さくら'
    				do: |
    					\h\s[0]さくらだもん。\w9\w9
    					\n
    					\n[half]
    					\s[6]……ごめん。
    					\e
    			-
    				do:
    					- \h\s[0]変わるよ。\e
    					- \h\s[0]カワルミライ。\e

この場合、conditionsフィルタにargumentの値を引数として渡して、返り値をValue値として使います。

ここでargumentの中、doキーがMiyoDictionaryのトップレベルに似ています。
MiyoがMiyoDictionaryのトップレベルを処理する関数を公開しているので、しばしばフィルタに渡す値がMiyoDictionaryのトップレベルと同じように扱われる場合があり、これはその実例です。

この場合はdoの値がいずれも連想配列値ではないのでフィルタ処理は1回で終わりですが、ここに連想配列値を指定すれば2階層目のフィルタ呼び出しが行われることになります。

    OnGhostChanging:
    	filters: conditions
    	argument:
    		conditions:
    			-
    				when.jse: |
    					request.headers.get('Reference0') == 'さくら'
    				do: |
    					\h\s[0]さくらだもん。\w9\w9
    					\n
    					\n[half]
    					\s[6]……ごめん。
    					\e
    			-
    				do:
    					filters: conditions
    					argument:
    						conditions:
    							-
    								when.jse: |
    									request.headers.get('Reference0') == 'まゆら'
    								do: |
    									\h\s[0]シテオク。\w9\w9
    									\u\s[10]とりあえずそれいえばええと思ってへんか？
    									\e
    							-
    								do: \h\s[0]変わるよ。\e

フィルタが適切に作られていれば、複雑な処理も単純な組み合わせで記述できます。

filtersキーには複数値を指定することも出来ます。

この場合、filtersのフィルタは前から順に実行され、前のフィルタの実行結果が後ろのフィルタの引数となります。

適切に連鎖させることで、ひとつのエントリで様々な処理が可能となります。

    OnGhostChanging:
    	filters: [my_filter, conditions]
    	argument:
    		my_filter:
    			option1: aaa
    			option2: bbb
    		conditions:
    			-
    				when.jse: |
    					request.headers.get('Reference0') == 'さくら'
    				do: |
    					\h\s[0]さくらだもん。\w9\w9
    					\n
    					\n[half]
    					\s[6]……ごめん。
    					\e
    			-
    				do:
    					- \h\s[0]変わるよ。\e
    					- \h\s[0]カワルミライ。\e

上の例では、まずmy_filterにargumentが引数として渡され、my_filterの返り値がconditionsに引数として渡され、その結果の値が最終的にOnGhostChangingの結果となります。

このような仕様の元で、いくつかのフィルタのポリシーが定められます。

例ではargumentの中にフィルタ名と同じ、my_filterキー、conditionsキーがあります。

こうしてフィルタそれぞれのオプション記述領域を分けることで、フィルタの連鎖が簡単になります。

なのでフィルタが引数を必要とするときは、argument下のフィルタと同名のキーにオプションを記述することを強く推奨します。

また基本的に最終的なValue値やSHIORI/3.0 Response値を返すフィルタでない限り、渡された引数をそのまま次のフィルタに渡す(返す)ことを強く推奨します。

後続のフィルタが受け取る引数が辞書の記述から加工されていると、予期しない動作を起こしがちです。

例でmy_filterがargumentそのままを使わず、conditionsを加工したとすれば、デバッグは煩雑になります。

### 辞書の読み込み

辞書は起動時に全てを読み込み、階層的なデータに変換して保持されます。

ディレクトリの中のファイルを一括で読み込む場合に、別ファイルに同一名エントリがあった場合は以下のようになります。

同一名エントリ全てが配列値なら読み込み順に要素が連結されます(ランダム選択なので順番は本質的に関係ありません)。

同一名エントリ全てが連想配列値なら、直下のキーは名前が重複しない場合マージされます。

それ以外の場合は読み込みエラーとなります。

### エントリの呼び出し

SHIORIのload、request、unload関数呼び出しに応じて呼び出されます。

load時は特別な名前のエントリ、「_load」が呼び出されます。

request時はSHIORI/3.0 RequestのIDヘッダ名と同名のエントリが呼び出されます。

unload時は特別な名前のエントリ、「_unload」が呼び出されます。

いずれのエントリ呼び出しも基本的に処理は同じですが、load、unload時は特にフィルタで使用する変数のうちIDとRequestを表す変数が空になります。
