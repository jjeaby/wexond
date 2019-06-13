import { AppWindow } from '../app-window';
import { clipboard, nativeImage, Menu } from 'electron';

export const getViewMenu = (
  appWindow: AppWindow,
  params: Electron.ContextMenuParams,
  webContents: Electron.WebContents,
) => {
  let menuItems: Electron.MenuItemConstructorOptions[] = [];

  if (params.linkURL !== '') {
    menuItems = menuItems.concat([
      {
        label: 'Open link in new tab',
        click: () => {
          appWindow.viewManager.create(
            {
              url: params.linkURL,
              active: false,
            },
            true,
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Copy link address',
        click: () => {
          clipboard.clear();
          clipboard.writeText(params.linkURL);
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.hasImageContents) {
    menuItems = menuItems.concat([
      {
        label: 'Open image in new tab',
        click: () => {
          appWindow.viewManager.create(
            {
              url: params.srcURL,
              active: false,
            },
            true,
          );
        },
      },
      {
        label: 'Copy image',
        click: () => {
          const img = nativeImage.createFromDataURL(params.srcURL);

          clipboard.clear();
          clipboard.writeImage(img);
        },
      },
      {
        label: 'Copy image address',
        click: () => {
          clipboard.clear();
          clipboard.writeText(params.srcURL);
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.isEditable) {
    menuItems = menuItems.concat([
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'pasteandmatchstyle',
      },
      {
        role: 'paste',
      },
      {
        role: 'selectall',
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (!params.isEditable && params.selectionText !== '') {
    menuItems = menuItems.concat([
      {
        role: 'copy',
      },
    ]);
  }

  if (
    !params.hasImageContents &&
    params.linkURL === '' &&
    params.selectionText === '' &&
    !params.isEditable
  ) {
    menuItems = menuItems.concat([
      {
        label: 'Go back',
        enabled: webContents.canGoBack(),
        click: () => {
          webContents.goBack();
        },
      },
      {
        label: 'Go forward',
        enabled: webContents.canGoForward(),
        click: () => {
          webContents.goForward();
        },
      },
      {
        label: 'Refresh',
        click: () => {
          webContents.reload();
        },
      },
      {
        type: 'separator',
      },
    ]);
  }
  menuItems.push({
    label: 'Translation',
    click: (getViewMenuObj, wannabeObj, exports) => {
      // console.log("Translation");
      // console.log(arguments)
      // console.log(getViewMenuObj)
      // console.log(wannabeObj)
      // console.log(exports)
      // console.log(webContents)
      // console.log(params)
      // console.log(webContents)
      webContents.send('ppause', params);

    },
  });
  menuItems.push({
    label: 'Inspect Element',
    click: () => {
      webContents.inspectElement(params.x, params.y);

      if (webContents.isDevToolsOpened()) {
        webContents.devToolsWebContents.focus();
      }
    },
  });

  return Menu.buildFromTemplate(menuItems);
};
