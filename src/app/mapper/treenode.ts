import * as procgo from 'gojs';

export class TreeNode extends procgo.Node {
  constructor() {
    super();
    this.treeExpandedChanged = (node) => {
      if (node.containingGroup !== null) {
        node.containingGroup
          .findExternalLinksConnected()
          .each((l) => l.invalidateRoute());
      }
    };
  }

  findVisibleNode() {
    // redirect links to lowest visible "ancestor" in the tree
    let n: procgo.Node = this;
    while (n !== null && !n.isVisible()) {
      n = n.findTreeParentNode();
    }
    return n;
  }
} // end TreeNode
