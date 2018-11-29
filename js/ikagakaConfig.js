/** イカガカの設定 */
var ikagakaConfig = {
    /**
     * 自動起動
     *
     * ページ読み込み後に自動起動する場合true、そうでない場合false
     * 自動起動しない場合、ボタンやその他何らかの手段でboot_nanikamanager()を実行して下さい。
     */
    autoBoot: true,
    /**
     * コンソールを出す
     *
     * コンソールを出す場合true、そうでない場合false
     */
    console: true,
    /**
     * 起動時に表示する画像
     *
     * 表示しない場合はnullを指定してください。
     * 表示位置などはcssの.ikagaka-loading-imageの記述で調整してください。
     */
    loadingImage: "./img/ikagaka-loading.png",
    /**
     * ベースウェア準備完了後処理
     *
     * ベースウェア起動後（自動起動の場合ゴーストが起動する直前）に実行したい処理を書く
     */
    afterPrepare: function() {},
    /**
     * 自動初期ゴースト起動後処理
     *
     * ベースウェア起動後初のゴースト起動（OnBoot処理）後に実行したい処理を書く
     * 自動起動用の処理ですが、自動起動がオフでもafterPrepareの後に実行されます。
     */
    afterAutoBoot: function() {},
    /**
     * 最初に起動するゴーストディレクトリ名（＝install.txtのdirectoryエントリ名）の配列
     *
     * 最低1つないとエラーになります。
     */
    initialGhosts: ["ikaga"],
    /**
     * 最初に起動するバルーンディレクトリ名（＝install.txtのdirectoryエントリ名）
     */
    initialBalloonpath: "origin",
    /**
     * 初期にインストールするnarのパス配列
     *
     * initialGhosts 及び initialBalloonpath はここで指定されたnarでインストールされるものである必要があります。
     * またnarは同一ドメインのサイト上にある必要があります。
     */
    initialNars: [
        "./vendor/nar/origin.nar",
        "./vendor/nar/ikaga.nar",
        "./vendor/nar/touhoku-zunko_or__.nar",
    ],
};

/*

# その他

以下の関数を実行すればイカガカの起動終了とデータ消去を制御できます。

// ベースウェアを起動
boot_nanikamanager()

// ベースウェアを終了
halt_nanikamanager()

// インストール情報を全消去
delete_storage()

// インストール情報を完全消去
delete_database()
エラーが出続ける状態になった場合などに使える

// narをインストール
install_nar(file, dirpath, sakuraname, type)
@param file narファイルのURLまたはBlobオブジェクト
@param dirath narがシェルの場合にインストールするゴーストのディレクトリを指定
@param sakuraname narがシェルの場合にインストールするゴーストのさくら側名を指定
@param type fileがURLなら"url", Blobなら"blob"

*/
