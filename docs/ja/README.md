# ＧＭツールキット（WFRP 4e）

[ウォーハンマーRPG](https://github.com/moo-man/WFRP4e-FoundryVTT)を[Foundry Virtual Tabletop](https://foundryvtt.com/)で、GMがゲーム管理するときに役に立つ調整、拡張、マクロを備えたユーティリティモジュールです。

### [English](../../README.md) | 日本語

## 互換性

バージョン 0.9.x が必用
- Foundry VTT: v9
- WFRP4e: v5

WFRP4e（4.0.6 - 4.3.1）およびFVTT（0.8.8 - 0.8.9）以前のバージョンを使用する場合は、ＧＭツールキットの[v0.8.0]を使用する必要があります。

## インストール方法
詳細は、[wiki](../../wiki)の[Getting Started guide](../../wiki/getting-started)を参照してください。

1. Foundry Virtual Tabletop・設定とセットアップの、アドオンモジュールタブから追加する。
   - モジュール名：`GM Toolkit (WFRP4e)`
   - マニフェストＵＲＬ：https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/latest/download/module.json
2. ＧＭがゲームワールドの起動中にモジュールを有効にする。
   - `ゲーム設定` > `モジュール管理` > `GM Toolkit (WFRP 4e)`
3.  `事典` > `Macro` > `GM Toolkit`から、マクロディレクトリに[マクロのインポート](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/wiki/getting-started#macros)を行う。
   - インポートしたマクロは、マクロホットバーの横にあるマクロディレクトリに表示されます。
   - マクロディレクトリを開き、必要なマクロをマクロホットバーの空いているスペースにドラッグする。
   - 更新されたマクロは、インポート済みのＧＭツールキットのマクロを*自動的に置き換えるものではありません*。更新されたマクロをを利用するためには、手動でマクロの事典からマクロディレクトリにインポートしなおす必要があります。
4. `事典` > `RollTable` > `GM Toolkit`からロール表をインポートする。

## 参考

* [変更履歴（英文）](/CHANGELOG.md)：最新および過去の変更点のまとめ
* [リリースノート（英文）](../../releases)：バージョンごとの最新および過去のアップデートの詳細
* [バックログ（英文）](../../issues)：既知の不具合や更新の提案・計画
* [ロードマップ（英文）](../../milestones)：計画中の機能の予定
* [Wiki（英文）](../../wiki)：機能のガイド

---
<a href='https://ko-fi.com/jagusti' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/5cbed8a433a3f45a772abaf5_SupportMe_blue-p-500.png' border='0' alt='Sponsor my WFRP / Foundry addiction at ko-fi.com' />
