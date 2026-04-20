const React = require('react');
const { View } = require('react-native');

const Svg = ({ children }) => React.createElement(View, { testID: 'svg' }, children);
const G = ({ children }) => React.createElement(View, null, children);
const Path = () => null;
const Rect = () => null;
const Circle = () => null;
const Ellipse = () => null;
const Line = () => null;
const Polygon = () => null;
const Polyline = () => null;
const Text = ({ children }) => React.createElement(View, null, children);
const TSpan = ({ children }) => React.createElement(View, null, children);
const TextPath = ({ children }) => React.createElement(View, null, children);
const Defs = () => null;
const RadialGradient = () => null;
const LinearGradient = () => null;
const Stop = () => null;
const ClipPath = () => null;
const Mask = () => null;
const Pattern = () => null;
const Use = () => null;
const Symbol = () => null;
const Image = () => null;

module.exports = {
  __esModule: true,
  default: Svg,
  Svg,
  G,
  Path,
  Rect,
  Circle,
  Ellipse,
  Line,
  Polygon,
  Polyline,
  Text,
  TSpan,
  TextPath,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  ClipPath,
  Mask,
  Pattern,
  Use,
  Symbol,
  Image,
};
