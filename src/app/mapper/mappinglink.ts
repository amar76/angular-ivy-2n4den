import * as procgo from 'gojs';
import { MapperConstants } from './mapper-constants';

export class MappingLink extends procgo.Link {
  getLinkPoint(node, port, spot, from, ortho, othernode, otherport) {
    const r = new procgo.Rect(
      port.getDocumentPoint(procgo.Spot.TopLeft),
      port.getDocumentPoint(procgo.Spot.BottomRight)
    );
    console.log(node.data.group);
    console.log(from);
    console.log(othernode.data.group);
    console.log('**************');
    const group = node.containingGroup;
    let b: any;

    if (
      node.data.group === MapperConstants.GROUP_LEFT_TREE ||
      node.data.group === MapperConstants.GROUP_RIGHT_TREE
    ) {
      b = group.actualBounds;
    } else if (
      node.data.group === MapperConstants.GROUP_MAPPER ||
      node.data.group === 'unknown'
    ) {
      b = node.actualBounds;
    }

    const op = othernode.getDocumentPoint(procgo.Spot.Center);
    const x = op.x > r.centerX ? b.right : b.left;
    return new procgo.Point(x, r.centerY);
  }
} // end MappingLink
