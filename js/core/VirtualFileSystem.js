export class VirtualFileSystem {
  constructor() {
    this.root = { type: 'dir', name: '/', children: new Map() };
    this.currentPath = [];
  }

  getAbsolutePath() {
    return '/' + this.currentPath.join('/');
  }

  cd(targetPath = '/') {
    const segments = this.getPathSegments(targetPath);
    let current = this.root;
    const newPath = [];

    for (const segment of segments) {
      if (current.type !== 'dir' || !current.children.has(segment)) {
        return { success: false, message: `Directory not found: ${targetPath}` };
      }

      const nextNode = current.children.get(segment);
      if (nextNode.type !== 'dir') {
        return { success: false, message: `Not a directory: ${segment}` };
      }

      current = nextNode;
      newPath.push(segment);
    }

    this.currentPath = newPath;
    return { success: true };
  }

  getPathSegments(path) {
    const rawSegments = path.startsWith('/')
      ? path.split('/')
      : [...this.currentPath, ...path.split('/')];
    const segments = [];

    for (const segment of rawSegments) {
      if (!segment || segment === '.') continue;
      if (segment === '..') {
        segments.pop();
      } else {
        segments.push(segment);
      }
    }

    return segments;
  }

  getNode(path = this.getAbsolutePath()) {
    const segments = path.startsWith('/') ? this.getPathSegments(path) : path.split('/').filter(Boolean);
    let current = this.root;

    for (const segment of segments) {
      if (current.type !== 'dir' || !current.children.has(segment)) return null;
      current = current.children.get(segment);
    }

    return current;
  }

  resolve(path) {
    return this.getNode('/' + this.getPathSegments(path).join('/'));
  }

  createDirectory(path) {
    let current = this.root;
    for (const segment of path.split('/').filter(Boolean)) {
      if (!current.children.has(segment)) {
        current.children.set(segment, { type: 'dir', name: segment, children: new Map() });
      }
      current = current.children.get(segment);
    }
  }

  createFile(path, content, isEncrypted = false) {
    const segments = path.split('/').filter(Boolean);
    const fileName = segments.pop();
    if (!fileName) return;

    const directoryPath = '/' + segments.join('/');
    this.createDirectory(directoryPath);
    const parent = this.getNode(directoryPath);
    if (parent?.type === 'dir') {
      parent.children.set(fileName, { type: 'file', name: fileName, content, isEncrypted });
    }
  }

  removeNode(name) {
    const current = this.getNode();
    return current?.type === 'dir' ? current.children.delete(name) : false;
  }

  toJSON() {
    const serialize = node => {
      if (node.type === 'file') {
        return { type: 'file', name: node.name, content: node.content, isEncrypted: node.isEncrypted };
      }
      return {
        type: 'dir',
        name: node.name,
        children: [...node.children.values()].map(serialize)
      };
    };
    return serialize(this.root);
  }

  fromJSON(data) {
    const deserialize = node => {
      if (node.type === 'file') {
        return { type: 'file', name: node.name, content: node.content, isEncrypted: node.isEncrypted };
      }
      const children = new Map((node.children || []).map(child => [child.name, deserialize(child)]));
      return { type: 'dir', name: node.name, children };
    };

    this.root = deserialize(data);
    this.currentPath = [];
  }
}
