import { ipcRenderer, remote } from 'electron';

const tabId = remote.getCurrentWebContents().id;

const goBack = () => {
  ipcRenderer.send('browserview-call', { tabId, scope: 'webContents.goBack' });
};

const goForward = () => {
  ipcRenderer.send('browserview-call', {
    tabId,
    scope: 'webContents.goForward',
  });
};

window.addEventListener('mouseup', e => {
  if (e.button === 3) {
    goBack();
  } else if (e.button === 4) {
    goForward();
  }
});

let beginningScrollLeft: number = null;
let beginningScrollRight: number = null;
let horizontalMouseMove = 0;
let verticalMouseMove = 0;

const resetCounters = () => {
  beginningScrollLeft = null;
  beginningScrollRight = null;
  horizontalMouseMove = 0;
  verticalMouseMove = 0;
};

function getScrollStartPoint(x: number, y: number) {
  let left = 0;
  let right = 0;

  let n = document.elementFromPoint(x, y);

  while (n) {
    if (n.scrollLeft !== undefined) {
      left = Math.max(left, n.scrollLeft);
      right = Math.max(right, n.scrollWidth - n.clientWidth - n.scrollLeft);
    }
    n = n.parentElement;
  }
  return { left, right };
}

document.addEventListener('wheel', e => {
  verticalMouseMove += e.deltaY;
  horizontalMouseMove += e.deltaX;

  if (beginningScrollLeft === null || beginningScrollRight === null) {
    const result = getScrollStartPoint(e.deltaX, e.deltaY);
    beginningScrollLeft = result.left;
    beginningScrollRight = result.right;
  }
});

ipcRenderer.on('scroll-touch-end', () => {
  if (
    horizontalMouseMove - beginningScrollRight > 150 &&
    Math.abs(horizontalMouseMove / verticalMouseMove) > 2.5
  ) {
    if (beginningScrollRight < 10) {
      goForward();
    }
  }

  if (
    horizontalMouseMove + beginningScrollLeft < -150 &&
    Math.abs(horizontalMouseMove / verticalMouseMove) > 2.5
  ) {
    if (beginningScrollLeft < 10) {
      goBack();
    }
  }

  resetCounters();
});

// ToDo Jin
ipcRenderer.on('ppause', async (e:any, params:any) => {
  console.log(document); // can now manipulate webview DOM
  console.log(params);
  const el = document.elementFromPoint(params.x, params.y);
  const text = el.textContent;
  console.log(el);
  console.log(text);

  // const url = 'http://125.143.162.249:7784/translator/translate'
  // const url = 'http://70.50.34.40:10801/translate'
  const url = 'http://127.0.0.1:10801/translate'

  const headers = new Headers({
    'content-type': 'application/json',
    'cache-control': 'no-cache',
  })

  const data = {
    id : 1,
    src : text,
    translate_type: 'enko',
    document_type : 'test',
    test_req: 'False',
  }

  const response = await fetch(url, {
    // credentials: 'same-origin', // 'include', default: 'omit'
    method: 'POST', // 'GET', 'PUT', 'DELETE', etc.
    body: JSON.stringify(data), // Coordinate the body type with 'Content-Type'
    headers,
  })

  const json = await response.json()
  console.log(json[0])
  console.log(json[0].tgt)
  el.textContent = el.textContent + "\n" + json[0].tgt;
});
