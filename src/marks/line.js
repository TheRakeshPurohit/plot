import {group} from "d3-array";
import {create} from "d3-selection";
import {line as shapeLine} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, identity, first, second} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles} from "../style.js";

export class Line extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z, // optional grouping for multiple series
      curve,
      transform,
      ...style
    } = {}
  ) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true}
      ],
      transform
    );
    this.curve = Curve(curve);
    Object.assign(this, Style({
      fill: "none",
      stroke: "currentColor",
      strokeWidth: z ? 1 : 1.5,
      ...style
    }));
  }
  render(I, {x, y}, {x: X, y: Y, z: Z}) {
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(g => g.selectAll()
          .data(Z ? group(I, i => Z[i]).values() : [I])
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", shapeLine()
              .curve(this.curve)
              .defined(i => defined(X[i]) && defined(Y[i]))
              .x(i => x(X[i]))
              .y(i => y(Y[i]))))
      .node();
  }
}

export function line(data, {x = first, y = second, ...options}) {
  return new Line(data, {...options, x, y});
}

// TODO Error if y is specified?
export function lineX(data, {x = identity, ...options} = {}) {
  return new Line(data, {...options, x, y: indexOf});
}

// TODO Error if x is specified?
export function lineY(data, {y = identity, ...options} = {}) {
  return new Line(data, {...options, x: indexOf, y});
}
