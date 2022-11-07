import { Component, OnInit } from '@angular/core';
import * as procgo from 'gojs';
import { MapperLayout } from './mapperlayout';
import { MapperConstants } from './mapper-constants';
import { TreeNode } from './treenode';
import { MappingLink } from './mappinglink';
import { ScrollingTable } from './ScrollingTable';
@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.css'],
})
export class MapperComponent implements OnInit {
  $ = procgo.GraphObject.make;
  PARENT_NODE = 1;
  constructor() {}

  ngOnInit() {
    this.initDiagram();
  }

  initDiagram() {
    function checkLink(fn, fp, tn, tp, link) {
      return true;
    }

    function initTreeNodeTemplate(go, dgm: procgo.Diagram) {
      var nodeTemplate = go(
        TreeNode,
        'Horizontal',
        { movable: false }, // user cannot move an individual node
        // no Adornment: instead change panel background color by binding to Node.isSelected
        { selectionAdorned: false },

        //new procgo.Binding('isOpposite', 'group', k => k === MapperConstants.GROUP_RIGHT_TREE),
        // whether the user can start drawing a link from or to this node depends on which group it's in
        new procgo.Binding(
          'fromLinkable',
          'group',
          (k) =>
            k === MapperConstants.GROUP_LEFT_TREE ||
            k === MapperConstants.GROUP_RIGHT_TREE
        ),
        new procgo.Binding(
          'toLinkable',
          'group',
          (k) =>
            k === MapperConstants.GROUP_RIGHT_TREE ||
            k === MapperConstants.GROUP_LEFT_TREE
        ),
        go(
          'TreeExpanderButton', // support expanding/collapsing subtrees
          {
            width: 14,
            height: 14,
            'ButtonIcon.stroke': 'black',
            'ButtonIcon.strokeWidth': 2,
            'ButtonBorder.fill': 'white',
            'ButtonBorder.stroke': 'white',
          }
        ),
        new procgo.Binding('background', 'isSelected', (s) =>
          s ? 'lightgray' : 'white'
        ).ofObject(),
        //// optional icon for each tree node
        go(
          procgo.Panel,
          'Horizontal', // everything within the border
          { width: 140 },
          new procgo.Binding('visible', 'visible'),
          go(
            procgo.Picture,
            {
              width: 14,
              height: 14,
              margin: new procgo.Margin(2, 4, 2, 2),
              imageStretch: procgo.GraphObject.Uniform,
            },

            new procgo.Binding('source', 'type', (data) => {
              if (data === 2) {
                return 'assets/images/common/content_default.svg';
              } else {
                return 'assets/images/common/folder_default.svg';
              }
            })
          ),

          go(
            procgo.TextBlock,
            { stroke: 'black', width: 120 },
            new procgo.Binding('text', 'key', (s) => 'item ' + s)
          ),

          go(
            procgo.TextBlock,
            'Add link',
            {
              click: function () {
                alert('clicked');
              },
            },
            {
              font: 'bold 10pt serif',
              isUnderline: true,
              stroke: 'blue',
              margin: new procgo.Margin(0, 0, 0, 12),
            },
            new procgo.Binding('visible', 'key', (data) => data === 0)
          )
        )
      ); // end Node

      return nodeTemplate;
    }

    function initLinkTemplate(go, dgm: procgo.Diagram) {
      dgm.linkTemplate = go(
        // with lines
        procgo.Link,
        {
          selectable: false,
          routing: procgo.Link.Orthogonal,
          fromEndSegmentLength: 4,
          toEndSegmentLength: 4,
          fromSpot: procgo.Spot.Bottom,
          toSpot: procgo.Spot.Left,
        },
        new procgo.Binding('fromSpot', 'containingGroup', (g) =>
          g.data.key === MapperConstants.GROUP_LEFT_TREE
            ? new procgo.Spot(0.001, 1, 7, 0)
            : new procgo.Spot(0.999, 1, -7, 0)
        ).ofObject(),
        new procgo.Binding('toSpot', 'containingGroup', (g) =>
          g.data.key === MapperConstants.GROUP_LEFT_TREE
            ? procgo.Spot.Left
            : procgo.Spot.Right
        ).ofObject(),
        go(procgo.Shape, { stroke: 'white' })
      );

      // These are the blue links connecting a tree node on the left side with one on the right side.
      dgm.linkTemplateMap.add(
        MapperConstants.LINK_MAPPING,
        go(
          MappingLink,
          {
            curve: procgo.Link.Bezier,
            corner: 5,
          },
          new procgo.Binding('visible', 'visible'),
          {
            isTreeLink: false,
            isLayoutPositioned: false,
            layerName: 'Foreground',
          },
          { relinkableFrom: true, relinkableTo: true },
          go(
            procgo.Shape,
            { strokeWidth: 2 },

            new procgo.Binding('stroke', 'isHighlighted', function (h) {
              return h ? 'red' : '#D3D3D3';
            }).ofObject()
          ),
          {
            click: function (e, obj) {},
          }
        )
      );
    }

    function makeGroupLayout(go) {
      new ScrollingTable().initAutoRepeatButton();
      new ScrollingTable().initScrollingTable();
      return go(
        procgo.TreeLayout, // taken from samples/treeView.html
        {
          alignment: procgo.TreeLayout.AlignmentStart,
          angle: 0,
          compaction: procgo.TreeLayout.CompactionNone,
          layerSpacing: 16,
          layerSpacingParentOverlap: 1,
          nodeIndentPastParent: 1.0,
          nodeSpacing: 17,
          setsPortSpot: false,
          setsChildPortSpot: false,
          // after the tree layout, change the width of each node so that all
          // of the nodes have widths such that the collection has a given width
          commitNodes: function () {
            // overriding TreeLayout.commitNodes
          },
        }
      );
    }
    function initTreeGroupTemplate(go, dgm: procgo.Diagram) {
      var groupTemplate = go(
        procgo.Group,
        'Auto',
        {
          deletable: false,
          layout: makeGroupLayout(go),
          movable: false,
          selectionAdorned: false,
          selectionObjectName: 'SIZED',
          locationObjectName: 'SIZED',
          resizable: false,
          resizeObjectName: 'SIZED',
        },
        new procgo.Binding('position', 'xy', procgo.Point.parse).makeTwoWay(
          procgo.Point.stringify
        ),
        new procgo.Binding('width', 'width'),
        go(procgo.Shape, {
          name: 'SIZED',
          // row: 1, column: 1,
          // minSize: new procgo.Size(20, 20),
          fill: 'white',
          stroke: '#E7E7E7',
        }),
        go(
          procgo.Panel,
          'Vertical',
          { defaultAlignment: procgo.Spot.Left, height: 490 },
          go(
            procgo.TextBlock,
            {
              font: 'bold 14pt sans-serif',
              margin: new procgo.Margin(5, 5, 0, 5),
            },
            new procgo.Binding('text')
          ),
          go(procgo.Placeholder, { padding: 0 })
        ),
        // scroll bar background
        go(procgo.Shape, {
          // row: 1, column: 2,
          name: 'VBACK',
          strokeWidth: 0,
          fill: '#DDD',
          margin: new procgo.Margin(0, 1, 0, 169),
          stretch: procgo.GraphObject.Fill,
          isActionable: true,
          width: 12,
          height: 490,
          actionDown: (e, back) => {
            // handle click for absolute positioning
          },
        }),
        // scrollbar thumb
        go(procgo.Shape, {
          // row: 1, column: 2,
          name: 'VTHUMB',
          stretch: procgo.GraphObject.Horizontal,
          margin: new procgo.Margin(0, 1, 0, 169),
          strokeWidth: 0,
          fill: 'gray',
          width: 12,
          alignmentFocus: procgo.Spot.Top,
          isActionable: true,
          actionMove: (e, thumb) => {
            const up =
              e.diagram.lastInput.documentPoint.y <
              e.diagram.firstInput.documentPoint.y;
            scrollGroup(thumb.part, 'pixel', up ? 'down' : 'up');
          },
        }),
        go(
          'AutoRepeatButton',
          {
            // row: 1, column: 2,
            name: 'TOP',
            alignment: procgo.Spot.Top,
            margin: new procgo.Margin(0, 1, 0, 169),
            click: function (e, but) {
              scrollGroup(but.part, 'pixel', 'down');
            },
          },
          go(procgo.Shape, 'TriangleUp', {
            stroke: null,
            desiredSize: new procgo.Size(8, 6),
          })
        ),
        go(
          'AutoRepeatButton',
          {
            // row: 1, column: 2,
            name: 'BOTTOM',
            alignment: procgo.Spot.Bottom,
            margin: new procgo.Margin(0, 1, 0, 169),
            click: function (e, but) {
              scrollGroup(but.part, 'pixel', 'up');
            },
          },
          go(procgo.Shape, 'TriangleDown', {
            stroke: null,
            desiredSize: new procgo.Size(8, 6),
          })
        )
      );
      return groupTemplate;
    }

    function scrollGroup(grp, unit, dir, dist?) {
      debugger;
      if (grp instanceof procgo.GraphObject) grp = grp.part;
      if (!(grp instanceof procgo.Group)) return;
      var diag = grp.diagram;
      if (!diag) return;
      var sized = grp.findObject('SIZED');
      if (!sized) sized = grp;
      var bnds = diag.computePartsBounds(grp.memberParts);
      var view = sized.getDocumentBounds();
      var dx = 0;
      var dy = 0;
      switch (unit) {
        case 'pixel':
          switch (dir) {
            case 'up':
              dy = -10;
              break;
            case 'down':
              dy = 10;
              break;
            case 'left':
              dx = -10;
              break;
            case 'right':
              dx = 10;
              break;
          }
          break;
        case 'line':
          switch (dir) {
            case 'up':
              dy = -20;
              break;
            case 'down':
              dy = 20;
              break;
            case 'left':
              dx = -20;
              break;
            case 'right':
              dx = 20;
              break;
          }
          break;
        case 'page':
          switch (dir) {
            case 'up':
              dy = Math.min(-10, -sized.actualBounds.height + 10);
              break;
            case 'down':
              dy = Math.max(10, sized.actualBounds.height - 10);
              break;
            case 'left':
              dx = Math.min(-10, -sized.actualBounds.width + 10);
              break;
            case 'right':
              dx = Math.max(10, sized.actualBounds.width - 10);
              break;
          }
          break;
      }
      if (dx > 0) dx = Math.min(dx, view.left + 4 - bnds.left);
      // top-left margin
      else if (dx < 0 && view.right - 2 > bnds.right) dx = 0;
      if (dy > 0) dy = Math.min(dy, view.top + 4 - bnds.top);
      // top-left margin
      else if (dy < 0 && view.bottom - 2 > bnds.bottom) dy = 0;
      const off = new procgo.Point(dx, dy);
      if (dx !== 0 || dy !== 0) {
        diag.commit(function (diag) {
          diag.moveParts(grp.memberParts, off, true);
        });
        updateGroupInteraction(grp, view);
      }
    }

    function updateGroupInteraction(grp, viewb) {
      if (grp instanceof procgo.GraphObject) grp = grp.part;
      if (!(grp instanceof procgo.Group)) return;
      if (viewb === undefined) {
        var sized = grp.findObject('SIZED');
        if (sized) {
          viewb = sized.getDocumentBounds();
        } else {
          return;
        }
      }
      grp.memberParts.each(function (part) {
        part.pickable =
          part.selectable =
          part.isInDocumentBounds =
          part.selectionAdorned =
            viewb.intersectsRect(part.actualBounds);
      });
      updateScrollbars(grp, viewb);
    }

    function updateScrollbars(grp, viewb?) {
      const selad = grp.findAdornment('Selection');
      // if (!selad) return;
      if (viewb === undefined) {
        var sized = grp.findObject('SIZED');
        if (sized) {
          viewb = sized.getDocumentBounds();
        } else {
          return;
        }
      }
      const panel = selad;
      const memb = grp.diagram.computePartsBounds(grp.memberParts);
      memb.union(memb.x, memb.y, 1, 1); // avoid zero width or height
      // const HTHUMB = panel.findObject("HTHUMB");
      // const LEFT = panel.findObject("LEFT");
      // const RIGHT = panel.findObject("RIGHT");
      const VTHUMB = grp.findObject('VTHUMB');
      const TOP = grp.findObject('TOP');
      const BOTTOM = grp.findObject('BOTTOM');
      const fx = Math.min(Math.max(0, (viewb.x - memb.x) / memb.width), 1);
      const fw = Math.min(Math.max(0, viewb.width / memb.width), 1);
      // const tx = Math.max(0, (viewb.width - LEFT.actualBounds.width - RIGHT.actualBounds.width));
      const fy = Math.min(Math.max(0, (viewb.y - memb.y) / memb.height), 1);
      const fh = Math.min(Math.max(0, viewb.height / memb.height), 1);
      const ty = Math.max(
        0,
        viewb.height - TOP.actualBounds.height - BOTTOM.actualBounds.height
      );
      // HTHUMB.visible = fw < 1 || viewb.x > memb.x || viewb.right < memb.right;
      // if (HTHUMB.visible) {
      //   HTHUMB.alignment = new procgo.Spot(0, 0.5, LEFT.actualBounds.width + fx * tx, 0);
      //   HTHUMB.width = fw * tx;
      // }
      VTHUMB.visible = fh < 1 || viewb.y > memb.y || viewb.bottom < memb.bottom;
      if (VTHUMB.visible) {
        VTHUMB.alignment = new procgo.Spot(
          0.5,
          0,
          0,
          TOP.actualBounds.height + fy * ty
        );
        VTHUMB.height = fh * ty;
      }
    }

    function makeTree(
      nodeDataArray,
      linkDataArray,
      parentdata,
      groupkey,
      rootkey
    ) {
      for (let i = 1; i <= 50; i++) {
        const childdata = {
          visible: true,
          key: 'T_' + rootkey + i,
          group: groupkey,
          type: 2,
          category: groupkey,
        };
        nodeDataArray.push(childdata);
        linkDataArray.push({ from: parentdata.key, to: childdata.key });
      }
    }
    function initModel() {
      let nodeDataArray: Object[];
      nodeDataArray = [
        {
          visible: true,
          isGroup: true,
          key: MapperConstants.GROUP_LEFT_TREE,
          text: '',
          xy: '0 0',
          width: 180,
          type: 1,
          category: MapperConstants.GROUP_LEFT_TREE,
        },
        // {
        //   visible: true,
        //   isGroup: true,
        //   key: MapperConstants.GROUP_RIGHT_TREE,
        //   text: '',
        //   xy: '0 0',
        //   width: 180,
        //   type: 1,
        //   category: MapperConstants.GROUP_RIGHT_TREE,
        // },
        // {
        //   isGroup: true,
        //   key: MapperConstants.GROUP_MAPPER,
        //   text: '',
        //   xy: '0 0',
        //   width: 350,
        //   type: 1,
        //   category: MapperConstants.GROUP_MAPPER,
        // },
      ];
      const linkDataArray = [];

      // initialize tree on left side
      let leftRoot = {
        key: 0,
        group: MapperConstants.GROUP_LEFT_TREE,
        type: 1,
        category: MapperConstants.GROUP_LEFT_TREE,
      };
      nodeDataArray.push(leftRoot);
      makeTree(
        nodeDataArray,
        linkDataArray,
        leftRoot,
        leftRoot.group,
        leftRoot.key
      );

      // initialize tree on right side
      let rightRoot = {
        key: 1000,
        group: MapperConstants.GROUP_RIGHT_TREE,
        type: 1,
        category: MapperConstants.GROUP_RIGHT_TREE,
      };
      nodeDataArray.push(rightRoot);

      makeTree(
        nodeDataArray,
        linkDataArray,
        rightRoot,
        rightRoot.group,
        rightRoot.key
      );

      //nodeDataArray.push({img: DataMapperComponent.mapperIcon, key: 2000, group:MapperConstants.GROUP_MAPPER, type: 1 , category: MapperConstants.GROUP_MAPPER});
      //nodeDataArray.push({ img: DataMapperComponent.mapperIcon, key: 2001, group:MapperConstants.GROUP_MAPPER, type: 1 , category: MapperConstants.GROUP_MAPPER});
      console.log(nodeDataArray);
      this.graphModel = new procgo.GraphLinksModel(
        nodeDataArray,
        linkDataArray
      );
      mapperDiagram.model = this.graphModel;

      // there's no data binding for Layout properties, so we need to set this explicitly
      //mapperDiagram.findNodeForKey(MapperConstants.GROUP_LEFT_TREE)['layout'].angle = 180;
    }

    const mapperDiagram = this.$(procgo.Diagram, 'mapperDiagramDiv', {
      'commandHandler.copiesTree': true,
      'commandHandler.deletesTree': true,
      minScale: 0.1,
      maxScale: 100,

      layout: this.$(MapperLayout),

      // newly drawn links always map a node in one tree to a node in another tree
      'linkingTool.archetypeLinkData': {
        category: MapperConstants.LINK_MAPPING,
      },
      'linkingTool.linkValidation': checkLink,
      'relinkingTool.linkValidation': checkLink,
      'undoManager.isEnabled': true,
      'animationManager.isEnabled': false,
      ViewportBoundsChanged: function (e) {
        let allowScroll = !e.diagram.viewportBounds.containsRect(
          e.diagram.documentBounds
        );
        mapperDiagram.allowHorizontalScroll = false;
        mapperDiagram.allowVerticalScroll = false;
      },
      ModelChanged: (e) => {
        if (e.isTransactionFinished) {
          // show the model data in the page's TextArea
          //console.log(e.model.toJson());
        }
      },
      'resizingTool.updateAdornments': function (part) {
        // procgo.ResizingTool.prototype.updateAdornments.call(this, part);
        procgo.ResizingTool.prototype.updateResizeHandles.call(this, part);
        if (!(part instanceof procgo.Group)) return;
        // updateScrollbars(part);TODO
        // const ad = part.findAdornment("Selection");
        // if (ad) {
        //   ad.ensureBounds();
        //   this.updateScrollbars(part);
        // }
      },
      // support mouse scrolling of subgraphs
      scroll: function (unit, dir, dist) {
        // override Diagram.scroll
        if (!dist) dist = 1;
        var it = this.findPartsAt(this.lastInput.documentPoint).iterator;
        while (it.next()) {
          var grp = it.value;
          if (grp instanceof procgo.Group) {
            // if the mouse is in a Group, scroll it
            // scrollGroup(grp, unit, dir, dist);TODO
            return;
          }
        }
        // otherwise, scroll the viewport normally
        procgo.Diagram.prototype.scroll.call(this, unit, dir, dist);
      },
    });
    var treeNodeTemplate = initTreeNodeTemplate(this.$, mapperDiagram);
    mapperDiagram.nodeTemplateMap.add(
      MapperConstants.GROUP_LEFT_TREE,
      treeNodeTemplate
    );
    // mapperDiagram.nodeTemplateMap.add(
    //   MapperConstants.GROUP_RIGHT_TREE,
    //   treeNodeTemplate
    // );

    initLinkTemplate(this.$, mapperDiagram);

    var treeGroupTemplate = initTreeGroupTemplate(this.$, mapperDiagram);
    mapperDiagram.groupTemplateMap.add(
      MapperConstants.GROUP_LEFT_TREE,
      treeGroupTemplate
    );
    // mapperDiagram.nodeTemplateMap.add(
    //   MapperConstants.GROUP_RIGHT_TREE,
    //   treeNodeTemplate
    // );
    initModel.call(this);
    mapperDiagram.animationManager.isEnabled = false;
    return mapperDiagram;
  }
}
