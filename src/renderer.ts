interface Window {
  navi: {
    versions: () => {
      electron: string
      node: string
      chrome: string
    }
  }
}

const v = window.navi.versions()
document.getElementById('versions')!.textContent =
  `Electron ${v.electron} · Node ${v.node} · Chrome ${v.chrome}`
