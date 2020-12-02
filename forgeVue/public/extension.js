class TemplateExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this.viewer = viewer;
  }

  load(){
    console.log('loaded')
    let elementId = this.viewer.getSelection()

    this.viewer.setTheme('light-theme');
    return true
  }

  unload(){
    console.log('unloaded')
    this.viewer.setTheme('dark-theme');
    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('TemplateExtension',TemplateExtension)