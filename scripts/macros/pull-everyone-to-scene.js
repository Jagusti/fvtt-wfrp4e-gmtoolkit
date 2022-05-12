pullEveryoneToScene();

async function pullEveryoneToScene() {
    if (!game.user.isGM) {
        ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.ScenePullActivate.NoPermission'), {});
    }

    switch (game.settings.get("wfrp4e-gm-toolkit", "scenePullActivate")) {
        case "prompt": 
            const dialog = new Dialog({
                title: (game.i18n.localize('GMTOOLKIT.Dialog.ScenePullActivate.Title')),
                content: `<form>
                        <div class="form-group">
                        <label>
                            ${game.i18n.localize("GMTOOLKIT.Dialog.ScenePullActivate.Prompt")}         
                            </label>
                        </div>
                    </form>`,
                buttons: {
                    activate: {
                        label: (game.i18n.localize('GMTOOLKIT.Dialog.ScenePullActivate.ActivateScene')),
                        callback: async () => pullToScene(true)
                        },
                    pull: {
                        label: (game.i18n.localize('GMTOOLKIT.Dialog.ScenePullActivate.PullOnly')),
                        callback: async () => pullToScene(false)
                        },
                },
                default: "pull"
            }).render(true);
            break;
        case "always": 
            pullToScene(true)
            break;
        case "never":
            pullToScene(false)
            break;
    }

    function pullToScene(activateScene) {
        let thisScene = game.scenes.viewed
        if (activateScene) {
            thisScene.update({"active" : true})
            let sceneActiveState = thisScene.data.active
            ui.notifications.notify(game.i18n.format('GMTOOLKIT.Message.ScenePullActivate.Activated', {sceneName: thisScene.name}));
        } else { 
            for ( let u of game.users.players ) {
                game.socket.emit("pullToScene", thisScene.id, u.id);
            }
            let sceneActiveState = String()
            if (thisScene.data.active == true ) {
                sceneActiveState = game.i18n.localize('GMTOOLKIT.Scene.Active')
            } else {
                sceneActiveState = game.i18n.localize('GMTOOLKIT.Scene.NotActive');
            }
            ui.notifications.notify(game.i18n.format('GMTOOLKIT.Message.ScenePullActivate.Pulled', {sceneName: thisScene.name, sceneActiveState}))
        }
    }
};

/* ==========
* MACRO: Pull Everyone to Scene
* VERSION: 0.9.3
* UPDATED: 2022-05-11
* DESCRIPTION: Yanks every player into the scene that the GM is on. 
* TIP: Optionally activate (or prompt to activate) the scene through Configure Session Options in module settings. 
========== */