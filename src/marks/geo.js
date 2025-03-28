import {geoGraticule10} from "d3";
import {create} from "../context.js";
import {negative, positive} from "../defined.js";
import {Mark} from "../mark.js";
import {identity, maybeNumberChannel} from "../options.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";
import {centroid} from "../transforms/centroid.js";
import {withDefaultSort} from "./dot.js";

const defaults = {
  ariaLabel: "geo",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Geo extends Mark {
  constructor(data, options = {}) {
    const [vr, cr] = maybeNumberChannel(options.r, 3);
    super(
      data,
      {
        x: {value: options.tip ? options.x : null, scale: "x", optional: true},
        y: {value: options.tip ? options.y : null, scale: "y", optional: true},
        r: {value: vr, scale: "r", filter: positive, optional: true},
        geometry: {value: options.geometry, scale: "projection"}
      },
      withDefaultSort(options),
      defaults
    );
    this.r = cr;
  }
  render(index, scales, channels, dimensions, context) {
    const {geometry: G, r: R} = channels;
    const path = context.path();
    const {r} = this;
    if (negative(r)) index = [];
    else if (r !== undefined) path.pointRadius(r);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) => {
        g.selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr("d", R ? (i) => path.pointRadius(R[i])(G[i]) : (i) => path(G[i]))
          .call(applyChannelStyles, this, channels);
      })
      .node();
  }
}

export function geo(data, options = {}) {
  if (options.tip && options.x === undefined && options.y === undefined) options = centroid(options);
  else if (options.geometry === undefined) options = {...options, geometry: identity};
  return new Geo(data, options);
}

export function sphere({strokeWidth = 1.5, ...options} = {}) {
  return geo({type: "Sphere"}, {strokeWidth, ...options});
}

export function graticule({strokeOpacity = 0.1, ...options} = {}) {
  return geo(geoGraticule10(), {strokeOpacity, ...options});
}
