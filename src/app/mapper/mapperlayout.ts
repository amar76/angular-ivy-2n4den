import * as procgo from 'gojs';
import { MapperConstants } from './mapper-constants';

export class MapperLayout extends procgo.Layout {
  constructor() {
    super();
    this.isViewportSized = true;
  }

  doLayout() {
    const r = this.diagram.viewportBounds.copy();
    if (!r.isReal()) {
      return;
    }
    const leftgrp = this.diagram.findNodeForKey(
      MapperConstants.GROUP_LEFT_TREE
    );
    // const rightgrp = this.diagram.findNodeForKey(
    //   MapperConstants.GROUP_RIGHT_TREE
    // );
    // const middlegrp = this.diagram.findNodeForKey(MapperConstants.GROUP_MAPPER);
    this.diagram.startTransaction('MapperLayout');
    // leftgrp.move(r.position);
    // middlegrp.move(new procgo.Point(r.left + leftgrp.actualBounds.width, r.y));
    // rightgrp.move(new procgo.Point(r.right - rightgrp.actualBounds.width, r.y));
    this.diagram.commitTransaction('MapperLayout');
  }
}
