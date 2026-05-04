import { importShared } from './chunk-_virtual___federation_fn_import.js';
import { requireReact } from './chunk-index.js';
import { requireReactDom } from './chunk-index2.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=requireReact(),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;
	{
	  jsxRuntime.exports = requireReactJsxRuntime_production_min();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = requireJsxRuntime();

var client = {};

var hasRequiredClient;

function requireClient () {
	if (hasRequiredClient) return client;
	hasRequiredClient = 1;
	var m = requireReactDom();
	{
	  client.createRoot = m.createRoot;
	  client.hydrateRoot = m.hydrateRoot;
	}
	return client;
}

var clientExports = requireClient();

var PopStateEventType = "popstate";
function createHashHistory(options = {}) {
  function createHashLocation(window2, globalHistory) {
    let {
      pathname = "/",
      search = "",
      hash = ""
    } = parsePath(window2.location.hash.substring(1));
    if (!pathname.startsWith("/") && !pathname.startsWith(".")) {
      pathname = "/" + pathname;
    }
    return createLocation(
      "",
      { pathname, search, hash },
      // state defaults to `null` because `window.history.state` does
      globalHistory.state && globalHistory.state.usr || null,
      globalHistory.state && globalHistory.state.key || "default"
    );
  }
  function createHashHref(window2, to) {
    let base = window2.document.querySelector("base");
    let href = "";
    if (base && base.getAttribute("href")) {
      let url = window2.location.href;
      let hashIndex = url.indexOf("#");
      href = hashIndex === -1 ? url : url.slice(0, hashIndex);
    }
    return href + "#" + (typeof to === "string" ? to : createPath(to));
  }
  function validateHashLocation(location, to) {
    warning(
      location.pathname.charAt(0) === "/",
      `relative pathnames are not supported in hash history.push(${JSON.stringify(
        to
      )})`
    );
  }
  return getUrlBasedHistory(
    createHashLocation,
    createHashHref,
    validateHashLocation,
    options
  );
}
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createKey() {
  return Math.random().toString(36).substring(2, 10);
}
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
function createLocation(current, to, state = null, key) {
  let location = {
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: "",
    ...typeof to === "string" ? parsePath(to) : to,
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  };
  return location;
}
function createPath({
  pathname = "/",
  search = "",
  hash = ""
}) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substring(hashIndex);
      path = path.substring(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substring(searchIndex);
      path = path.substring(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref2, validateLocation, options = {}) {
  let { window: window2 = document.defaultView, v5Compat = false } = options;
  let globalHistory = window2.history;
  let action = "POP";
  let listener = null;
  let index = getIndex();
  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, "");
  }
  function getIndex() {
    let state = globalHistory.state || { idx: null };
    return state.idx;
  }
  function handlePop() {
    action = "POP";
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({ action, location: history.location, delta });
    }
  }
  function push(to, state) {
    action = "PUSH";
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window2.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 1 });
    }
  }
  function replace2(to, state) {
    action = "REPLACE";
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 0 });
    }
  }
  function createURL(to) {
    return createBrowserURLImpl(to);
  }
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window2, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window2.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window2.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref2(window2, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace: replace2,
    go(n) {
      return globalHistory.go(n);
    }
  };
  return history;
}
function createBrowserURLImpl(to, isAbsolute = false) {
  let base = "http://localhost";
  if (typeof window !== "undefined") {
    base = window.location.origin !== "null" ? window.location.origin : window.location.href;
  }
  invariant(base, "No window.location.(origin|href) available to create URL");
  let href = typeof to === "string" ? to : createPath(to);
  href = href.replace(/ $/, "%20");
  if (!isAbsolute && href.startsWith("//")) {
    href = base + href;
  }
  return new URL(href, base);
}
function matchRoutes(routes, locationArg, basename = "/") {
  return matchRoutesImpl(routes, locationArg, basename, false);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial) {
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    let decoded = decodePath(pathname);
    matches = matchRouteBranch(
      branches[i],
      decoded,
      allowPartial
    );
  }
  return matches;
}
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "", _hasParentOptionalSegments = false) {
  let flattenRoute = (route, index, hasParentOptionalSegments = _hasParentOptionalSegments, relativePath) => {
    let meta = {
      relativePath: relativePath === void 0 ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      if (!meta.relativePath.startsWith(parentPath) && hasParentOptionalSegments) {
        return;
      }
      invariant(
        meta.relativePath.startsWith(parentPath),
        `Absolute route path "${meta.relativePath}" nested under path "${parentPath}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`
      );
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        `Index routes must not have child routes. Please remove all child routes from route path "${path}".`
      );
      flattenRoutes(
        route.children,
        branches,
        routesMeta,
        path,
        hasParentOptionalSegments
      );
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    if (route.path === "" || !route.path?.includes("?")) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, true, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0) return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(
    ...restExploded.map(
      (subpath) => subpath === "" ? required : [required, subpath].join("/")
    )
  );
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map(
    (exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded
  );
}
function rankRouteBranches(branches) {
  branches.sort(
    (a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(
      a.routesMeta.map((meta) => meta.childrenIndex),
      b.routesMeta.map((meta) => meta.childrenIndex)
    )
  );
}
var paramRe = /^:[\w-]+$/;
var dynamicSegmentValue = 3;
var indexRouteValue = 2;
var emptySegmentValue = 1;
var staticSegmentValue = 10;
var splatPenalty = -2;
var isSplat = (s) => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s) => !isSplat(s)).reduce(
    (score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue),
    initialScore
  );
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - b[b.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function matchRouteBranch(branch, pathname, allowPartial = false) {
  let { routesMeta } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath(
      { path: meta.relativePath, caseSensitive: meta.caseSensitive, end },
      remainingPathname
    );
    let route = meta.route;
    if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) {
      match = matchPath(
        {
          path: meta.relativePath,
          caseSensitive: meta.caseSensitive,
          end: false
        },
        remainingPathname
      );
    }
    if (!match) {
      return null;
    }
    Object.assign(matchedParams, match.params);
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(
        joinPaths([matchedPathname, match.pathnameBase])
      ),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = { path: pattern, caseSensitive: false, end: true };
  }
  let [matcher, compiledParams] = compilePath(
    pattern.path,
    pattern.caseSensitive,
    pattern.end
  );
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce(
    (memo2, { paramName, isOptional }, index) => {
      if (paramName === "*") {
        let splatValue = captureGroups[index] || "";
        pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
      }
      const value = captureGroups[index];
      if (isOptional && !value) {
        memo2[paramName] = void 0;
      } else {
        memo2[paramName] = (value || "").replace(/%2F/g, "/");
      }
      return memo2;
    },
    {}
  );
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive = false, end = true) {
  warning(
    path === "*" || !path.endsWith("*") || path.endsWith("/*"),
    `Route path "${path}" will be treated as if it were "${path.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${path.replace(/\*$/, "/*")}".`
  );
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(
    /\/:([\w-]+)(\?)?/g,
    (_, paramName, isOptional) => {
      params.push({ paramName, isOptional: isOptional != null });
      return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
    }
  ).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  if (path.endsWith("*")) {
    params.push({ paramName: "*" });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else ;
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, params];
}
function decodePath(value) {
  try {
    return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
  } catch (error) {
    warning(
      false,
      `The URL path "${value}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${error}).`
    );
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
var ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
function resolvePath(to, fromPathname = "/") {
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname;
  if (toPathname) {
    toPathname = toPathname.replace(/\/\/+/g, "/");
    if (toPathname.startsWith("/")) {
      pathname = resolvePathname(toPathname.substring(1), "/");
    } else {
      pathname = resolvePathname(toPathname, fromPathname);
    }
  } else {
    pathname = fromPathname;
  }
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return `Cannot include a '${char}' character in a manually specified \`to.${field}\` field [${JSON.stringify(
    path
  )}].  Please separate it out to the \`to.${dest}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function getPathContributingMatches(matches) {
  return matches.filter(
    (match, index) => index === 0 || match.route.path && match.route.path.length > 0
  );
}
function getResolveToMatches(matches) {
  let pathMatches = getPathContributingMatches(matches);
  return pathMatches.map(
    (match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase
  );
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative = false) {
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = { ...toArg };
    invariant(
      !to.pathname || !to.pathname.includes("?"),
      getInvalidPathError("?", "pathname", "search", to)
    );
    invariant(
      !to.pathname || !to.pathname.includes("#"),
      getInvalidPathError("#", "pathname", "hash", to)
    );
    invariant(
      !to.search || !to.search.includes("#"),
      getInvalidPathError("#", "search", "hash", to)
    );
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
var joinPaths = (paths) => paths.join("/").replace(/\/\/+/g, "/");
var normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
var normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
var normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
var ErrorResponseImpl = class {
  constructor(status, statusText, data2, internal = false) {
    this.status = status;
    this.statusText = statusText || "";
    this.internal = internal;
    if (data2 instanceof Error) {
      this.data = data2.toString();
      this.error = data2;
    } else {
      this.data = data2;
    }
  }
};
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
function getRoutePattern(matches) {
  return matches.map((m) => m.route.path).filter(Boolean).join("/").replace(/\/\/*/g, "/") || "/";
}
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function parseToInfo(_to, basename) {
  let to = _to;
  if (typeof to !== "string" || !ABSOLUTE_URL_REGEX.test(to)) {
    return {
      absoluteURL: void 0,
      isExternal: false,
      to
    };
  }
  let absoluteURL = to;
  let isExternal = false;
  if (isBrowser) {
    try {
      let currentUrl = new URL(window.location.href);
      let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
      let path = stripBasename(targetUrl.pathname, basename);
      if (targetUrl.origin === currentUrl.origin && path != null) {
        to = path + targetUrl.search + targetUrl.hash;
      } else {
        isExternal = true;
      }
    } catch (e) {
      warning(
        false,
        `<Link to="${to}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`
      );
    }
  }
  return {
    absoluteURL,
    isExternal,
    to
  };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var validMutationMethodsArr = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
];
new Set(
  validMutationMethodsArr
);
var validRequestMethodsArr = [
  "GET",
  ...validMutationMethodsArr
];
new Set(validRequestMethodsArr);
const React$l = await importShared('react');

var DataRouterContext = React$l.createContext(null);
DataRouterContext.displayName = "DataRouter";
var DataRouterStateContext = React$l.createContext(null);
DataRouterStateContext.displayName = "DataRouterState";
var RSCRouterContext = React$l.createContext(false);
function useIsRSCRouterContext() {
  return React$l.useContext(RSCRouterContext);
}
var ViewTransitionContext = React$l.createContext({
  isTransitioning: false
});
ViewTransitionContext.displayName = "ViewTransition";
var FetchersContext = React$l.createContext(
  /* @__PURE__ */ new Map()
);
FetchersContext.displayName = "Fetchers";
var AwaitContext = React$l.createContext(null);
AwaitContext.displayName = "Await";
var NavigationContext = React$l.createContext(
  null
);
NavigationContext.displayName = "Navigation";
var LocationContext = React$l.createContext(
  null
);
LocationContext.displayName = "Location";
var RouteContext = React$l.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
RouteContext.displayName = "Route";
var RouteErrorContext = React$l.createContext(null);
RouteErrorContext.displayName = "RouteError";
const React2$1 = await importShared('react');

var ERROR_DIGEST_BASE = "REACT_ROUTER_ERROR";
var ERROR_DIGEST_REDIRECT = "REDIRECT";
var ERROR_DIGEST_ROUTE_ERROR_RESPONSE = "ROUTE_ERROR_RESPONSE";
function decodeRedirectErrorDigest(digest) {
  if (digest.startsWith(`${ERROR_DIGEST_BASE}:${ERROR_DIGEST_REDIRECT}:{`)) {
    try {
      let parsed = JSON.parse(digest.slice(28));
      if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string" && typeof parsed.location === "string" && typeof parsed.reloadDocument === "boolean" && typeof parsed.replace === "boolean") {
        return parsed;
      }
    } catch {
    }
  }
}
function decodeRouteErrorResponseDigest(digest) {
  if (digest.startsWith(
    `${ERROR_DIGEST_BASE}:${ERROR_DIGEST_ROUTE_ERROR_RESPONSE}:{`
  )) {
    try {
      let parsed = JSON.parse(digest.slice(40));
      if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string") {
        return new ErrorResponseImpl(
          parsed.status,
          parsed.statusText,
          parsed.data
        );
      }
    } catch {
    }
  }
}
function useHref(to, { relative } = {}) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useHref() may be used only in the context of a <Router> component.`
  );
  let { basename, navigator } = React2$1.useContext(NavigationContext);
  let { hash, pathname, search } = useResolvedPath(to, { relative });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator.createHref({ pathname: joinedPathname, search, hash });
}
function useInRouterContext() {
  return React2$1.useContext(LocationContext) != null;
}
function useLocation() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useLocation() may be used only in the context of a <Router> component.`
  );
  return React2$1.useContext(LocationContext).location;
}
var navigateEffectWarning = `You should call navigate() in a React.useEffect(), not when your component is first rendered.`;
function useIsomorphicLayoutEffect(cb) {
  let isStatic = React2$1.useContext(NavigationContext).static;
  if (!isStatic) {
    React2$1.useLayoutEffect(cb);
  }
}
function useNavigate() {
  let { isDataRoute } = React2$1.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useNavigate() may be used only in the context of a <Router> component.`
  );
  let dataRouterContext = React2$1.useContext(DataRouterContext);
  let { basename, navigator } = React2$1.useContext(NavigationContext);
  let { matches } = React2$1.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  let activeRef = React2$1.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React2$1.useCallback(
    (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current) return;
      if (typeof to === "number") {
        navigator.go(to);
        return;
      }
      let path = resolveTo(
        to,
        JSON.parse(routePathnamesJson),
        locationPathname,
        options.relative === "path"
      );
      if (dataRouterContext == null && basename !== "/") {
        path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
      }
      (!!options.replace ? navigator.replace : navigator.push)(
        path,
        options.state,
        options
      );
    },
    [
      basename,
      navigator,
      routePathnamesJson,
      locationPathname,
      dataRouterContext
    ]
  );
  return navigate;
}
var OutletContext = React2$1.createContext(null);
function useOutlet(context) {
  let outlet = React2$1.useContext(RouteContext).outlet;
  return React2$1.useMemo(
    () => outlet && /* @__PURE__ */ React2$1.createElement(OutletContext.Provider, { value: context }, outlet),
    [outlet, context]
  );
}
function useResolvedPath(to, { relative } = {}) {
  let { matches } = React2$1.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  return React2$1.useMemo(
    () => resolveTo(
      to,
      JSON.parse(routePathnamesJson),
      locationPathname,
      relative === "path"
    ),
    [to, routePathnamesJson, locationPathname, relative]
  );
}
function useRoutes(routes, locationArg) {
  return useRoutesImpl(routes, locationArg);
}
function useRoutesImpl(routes, locationArg, dataRouterState, onError, future) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`
  );
  let { navigator } = React2$1.useContext(NavigationContext);
  let { matches: parentMatches } = React2$1.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;
  {
    let parentPath = parentRoute && parentRoute.path || "";
    warningOnce(
      parentPathname,
      !parentRoute || parentPath.endsWith("*") || parentPath.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${parentPathname}" (under <Route path="${parentPath}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${parentPath}"> to <Route path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`
    );
  }
  let locationFromContext = useLocation();
  let location;
  if (locationArg) {
    let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    invariant(
      parentPathnameBase === "/" || parsedLocationArg.pathname?.startsWith(parentPathnameBase),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${parentPathnameBase}" but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`
    );
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;
  if (parentPathnameBase !== "/") {
    let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
    let segments = pathname.replace(/^\//, "").split("/");
    remainingPathname = "/" + segments.slice(parentSegments.length).join("/");
  }
  let matches = matchRoutes(routes, { pathname: remainingPathname });
  {
    warning(
      parentRoute || matches != null,
      `No routes matched location "${location.pathname}${location.search}${location.hash}" `
    );
    warning(
      matches == null || matches[matches.length - 1].route.element !== void 0 || matches[matches.length - 1].route.Component !== void 0 || matches[matches.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`
    );
  }
  let renderedMatches = _renderMatches(
    matches && matches.map(
      (match) => Object.assign({}, match, {
        params: Object.assign({}, parentParams, match.params),
        pathname: joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes.
          // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          navigator.encodeLocation ? navigator.encodeLocation(
            match.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : match.pathname
        ]),
        pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes
          // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          navigator.encodeLocation ? navigator.encodeLocation(
            match.pathnameBase.replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : match.pathnameBase
        ])
      })
    ),
    parentMatches,
    dataRouterState,
    onError,
    future
  );
  if (locationArg && renderedMatches) {
    return /* @__PURE__ */ React2$1.createElement(
      LocationContext.Provider,
      {
        value: {
          location: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
            ...location
          },
          navigationType: "POP"
          /* Pop */
        }
      },
      renderedMatches
    );
  }
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
  let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };
  let devInfo = null;
  {
    console.error(
      "Error handled by React Router default ErrorBoundary:",
      error
    );
    devInfo = /* @__PURE__ */ React2$1.createElement(React2$1.Fragment, null, /* @__PURE__ */ React2$1.createElement("p", null, "💿 Hey developer 👋"), /* @__PURE__ */ React2$1.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ React2$1.createElement("code", { style: codeStyles }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ React2$1.createElement("code", { style: codeStyles }, "errorElement"), " prop on your route."));
  }
  return /* @__PURE__ */ React2$1.createElement(React2$1.Fragment, null, /* @__PURE__ */ React2$1.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ React2$1.createElement("h3", { style: { fontStyle: "italic" } }, message), stack ? /* @__PURE__ */ React2$1.createElement("pre", { style: preStyles }, stack) : null, devInfo);
}
var defaultErrorElement = /* @__PURE__ */ React2$1.createElement(DefaultErrorComponent, null);
var RenderErrorBoundary = class extends React2$1.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }
    return {
      error: props.error !== void 0 ? props.error : state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error(
        "React Router caught the following error during render",
        error
      );
    }
  }
  render() {
    let error = this.state.error;
    if (this.context && typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
      const decoded = decodeRouteErrorResponseDigest(error.digest);
      if (decoded) error = decoded;
    }
    let result = error !== void 0 ? /* @__PURE__ */ React2$1.createElement(RouteContext.Provider, { value: this.props.routeContext }, /* @__PURE__ */ React2$1.createElement(
      RouteErrorContext.Provider,
      {
        value: error,
        children: this.props.component
      }
    )) : this.props.children;
    if (this.context) {
      return /* @__PURE__ */ React2$1.createElement(RSCErrorHandler, { error }, result);
    }
    return result;
  }
};
RenderErrorBoundary.contextType = RSCRouterContext;
var errorRedirectHandledMap = /* @__PURE__ */ new WeakMap();
function RSCErrorHandler({
  children,
  error
}) {
  let { basename } = React2$1.useContext(NavigationContext);
  if (typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
    let redirect2 = decodeRedirectErrorDigest(error.digest);
    if (redirect2) {
      let existingRedirect = errorRedirectHandledMap.get(error);
      if (existingRedirect) throw existingRedirect;
      let parsed = parseToInfo(redirect2.location, basename);
      if (isBrowser && !errorRedirectHandledMap.get(error)) {
        if (parsed.isExternal || redirect2.reloadDocument) {
          window.location.href = parsed.absoluteURL || parsed.to;
        } else {
          const redirectPromise = Promise.resolve().then(
            () => window.__reactRouterDataRouter.navigate(parsed.to, {
              replace: redirect2.replace
            })
          );
          errorRedirectHandledMap.set(error, redirectPromise);
          throw redirectPromise;
        }
      }
      return /* @__PURE__ */ React2$1.createElement(
        "meta",
        {
          httpEquiv: "refresh",
          content: `0;url=${parsed.absoluteURL || parsed.to}`
        }
      );
    }
  }
  return children;
}
function RenderedRoute({ routeContext, match, children }) {
  let dataRouterContext = React2$1.useContext(DataRouterContext);
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /* @__PURE__ */ React2$1.createElement(RouteContext.Provider, { value: routeContext }, children);
}
function _renderMatches(matches, parentMatches = [], dataRouterState = null, onErrorHandler = null, future = null) {
  if (matches == null) {
    if (!dataRouterState) {
      return null;
    }
    if (dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else if (parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;
  let errors = dataRouterState?.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(
      (m) => m.route.id && errors?.[m.route.id] !== void 0
    );
    invariant(
      errorIndex >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(
        errors
      ).join(",")}`
    );
    renderedMatches = renderedMatches.slice(
      0,
      Math.min(renderedMatches.length, errorIndex + 1)
    );
  }
  let renderFallback = false;
  let fallbackIndex = -1;
  if (dataRouterState) {
    for (let i = 0; i < renderedMatches.length; i++) {
      let match = renderedMatches[i];
      if (match.route.HydrateFallback || match.route.hydrateFallbackElement) {
        fallbackIndex = i;
      }
      if (match.route.id) {
        let { loaderData, errors: errors2 } = dataRouterState;
        let needsToRunLoader = match.route.loader && !loaderData.hasOwnProperty(match.route.id) && (!errors2 || errors2[match.route.id] === void 0);
        if (match.route.lazy || needsToRunLoader) {
          renderFallback = true;
          if (fallbackIndex >= 0) {
            renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
          } else {
            renderedMatches = [renderedMatches[0]];
          }
          break;
        }
      }
    }
  }
  let onError = dataRouterState && onErrorHandler ? (error, errorInfo) => {
    onErrorHandler(error, {
      location: dataRouterState.location,
      params: dataRouterState.matches?.[0]?.params ?? {},
      unstable_pattern: getRoutePattern(dataRouterState.matches),
      errorInfo
    });
  } : void 0;
  return renderedMatches.reduceRight(
    (outlet, match, index) => {
      let error;
      let shouldRenderHydrateFallback = false;
      let errorElement = null;
      let hydrateFallbackElement = null;
      if (dataRouterState) {
        error = errors && match.route.id ? errors[match.route.id] : void 0;
        errorElement = match.route.errorElement || defaultErrorElement;
        if (renderFallback) {
          if (fallbackIndex < 0 && index === 0) {
            warningOnce(
              "route-fallback",
              false,
              "No `HydrateFallback` element provided to render during initial hydration"
            );
            shouldRenderHydrateFallback = true;
            hydrateFallbackElement = null;
          } else if (fallbackIndex === index) {
            shouldRenderHydrateFallback = true;
            hydrateFallbackElement = match.route.hydrateFallbackElement || null;
          }
        }
      }
      let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
      let getChildren = () => {
        let children;
        if (error) {
          children = errorElement;
        } else if (shouldRenderHydrateFallback) {
          children = hydrateFallbackElement;
        } else if (match.route.Component) {
          children = /* @__PURE__ */ React2$1.createElement(match.route.Component, null);
        } else if (match.route.element) {
          children = match.route.element;
        } else {
          children = outlet;
        }
        return /* @__PURE__ */ React2$1.createElement(
          RenderedRoute,
          {
            match,
            routeContext: {
              outlet,
              matches: matches2,
              isDataRoute: dataRouterState != null
            },
            children
          }
        );
      };
      return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ React2$1.createElement(
        RenderErrorBoundary,
        {
          location: dataRouterState.location,
          revalidation: dataRouterState.revalidation,
          component: errorElement,
          error,
          children: getChildren(),
          routeContext: { outlet: null, matches: matches2, isDataRoute: true },
          onError
        }
      ) : getChildren();
    },
    null
  );
}
function getDataRouterConsoleError(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext(hookName) {
  let ctx = React2$1.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError(hookName));
  return ctx;
}
function useDataRouterState(hookName) {
  let state = React2$1.useContext(DataRouterStateContext);
  invariant(state, getDataRouterConsoleError(hookName));
  return state;
}
function useRouteContext(hookName) {
  let route = React2$1.useContext(RouteContext);
  invariant(route, getDataRouterConsoleError(hookName));
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  invariant(
    thisRoute.route.id,
    `${hookName} can only be used on routes that contain a unique "id"`
  );
  return thisRoute.route.id;
}
function useRouteId() {
  return useCurrentRouteId(
    "useRouteId"
    /* UseRouteId */
  );
}
function useRouteError() {
  let error = React2$1.useContext(RouteErrorContext);
  let state = useDataRouterState(
    "useRouteError"
    /* UseRouteError */
  );
  let routeId = useCurrentRouteId(
    "useRouteError"
    /* UseRouteError */
  );
  if (error !== void 0) {
    return error;
  }
  return state.errors?.[routeId];
}
function useNavigateStable() {
  let { router } = useDataRouterContext(
    "useNavigate"
    /* UseNavigateStable */
  );
  let id = useCurrentRouteId(
    "useNavigate"
    /* UseNavigateStable */
  );
  let activeRef = React2$1.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React2$1.useCallback(
    async (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current) return;
      if (typeof to === "number") {
        await router.navigate(to);
      } else {
        await router.navigate(to, { fromRouteId: id, ...options });
      }
    },
    [router, id]
  );
  return navigate;
}
var alreadyWarned = {};
function warningOnce(key, cond, message) {
  if (!cond && !alreadyWarned[key]) {
    alreadyWarned[key] = true;
    warning(false, message);
  }
}
const React3 = await importShared('react');

var alreadyWarned2 = {};
function warnOnce(condition, message) {
  if (!condition && !alreadyWarned2[message]) {
    alreadyWarned2[message] = true;
    console.warn(message);
  }
}
var USE_OPTIMISTIC = "useOptimistic";
React3[USE_OPTIMISTIC];
React3.memo(DataRoutes);
function DataRoutes({
  routes,
  future,
  state,
  onError
}) {
  return useRoutesImpl(routes, void 0, state, onError, future);
}
function Navigate({
  to,
  replace: replace2,
  state,
  relative
}) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of
    // the router loaded. We can help them understand how to avoid that.
    `<Navigate> may be used only in the context of a <Router> component.`
  );
  let { static: isStatic } = React3.useContext(NavigationContext);
  warning(
    !isStatic,
    `<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.`
  );
  let { matches } = React3.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let navigate = useNavigate();
  let path = resolveTo(
    to,
    getResolveToMatches(matches),
    locationPathname,
    relative === "path"
  );
  let jsonPath = JSON.stringify(path);
  React3.useEffect(() => {
    navigate(JSON.parse(jsonPath), { replace: replace2, state, relative });
  }, [navigate, jsonPath, relative, replace2, state]);
  return null;
}
function Outlet(props) {
  return useOutlet(props.context);
}
function Route(props) {
  invariant(
    false,
    `A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.`
  );
}
function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = "POP",
  navigator,
  static: staticProp = false,
  unstable_useTransitions
}) {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`
  );
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React3.useMemo(
    () => ({
      basename,
      navigator,
      static: staticProp,
      unstable_useTransitions,
      future: {}
    }),
    [basename, navigator, staticProp, unstable_useTransitions]
  );
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = React3.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  warning(
    locationContext != null,
    `<Router basename="${basename}"> is not able to match the URL "${pathname}${search}${hash}" because it does not start with the basename, so the <Router> won't render anything.`
  );
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ React3.createElement(NavigationContext.Provider, { value: navigationContext }, /* @__PURE__ */ React3.createElement(LocationContext.Provider, { children, value: locationContext }));
}
function Routes({
  children,
  location
}) {
  return useRoutes(createRoutesFromChildren(children), location);
}
(class extends React3.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error(
        "<Await> caught the following error during render",
        error,
        errorInfo
      );
    }
  }
  render() {
    let { children, errorElement, resolve } = this.props;
    let promise = null;
    let status = 0;
    if (!(resolve instanceof Promise)) {
      status = 1;
      promise = Promise.resolve();
      Object.defineProperty(promise, "_tracked", { get: () => true });
      Object.defineProperty(promise, "_data", { get: () => resolve });
    } else if (this.state.error) {
      status = 2;
      let renderError = this.state.error;
      promise = Promise.reject().catch(() => {
      });
      Object.defineProperty(promise, "_tracked", { get: () => true });
      Object.defineProperty(promise, "_error", { get: () => renderError });
    } else if (resolve._tracked) {
      promise = resolve;
      status = "_error" in promise ? 2 : "_data" in promise ? 1 : 0;
    } else {
      status = 0;
      Object.defineProperty(resolve, "_tracked", { get: () => true });
      promise = resolve.then(
        (data2) => Object.defineProperty(resolve, "_data", { get: () => data2 }),
        (error) => {
          this.props.onError?.(error);
          Object.defineProperty(resolve, "_error", { get: () => error });
        }
      );
    }
    if (status === 2 && !errorElement) {
      throw promise._error;
    }
    if (status === 2) {
      return /* @__PURE__ */ React3.createElement(AwaitContext.Provider, { value: promise, children: errorElement });
    }
    if (status === 1) {
      return /* @__PURE__ */ React3.createElement(AwaitContext.Provider, { value: promise, children });
    }
    throw promise;
  }
});
function createRoutesFromChildren(children, parentPath = []) {
  let routes = [];
  React3.Children.forEach(children, (element, index) => {
    if (!React3.isValidElement(element)) {
      return;
    }
    let treePath = [...parentPath, index];
    if (element.type === React3.Fragment) {
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children, treePath)
      );
      return;
    }
    invariant(
      element.type === Route,
      `[${typeof element.type === "string" ? element.type : element.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`
    );
    invariant(
      !element.props.index || !element.props.children,
      "An index route cannot have child routes."
    );
    let route = {
      id: element.props.id || treePath.join("-"),
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      Component: element.props.Component,
      index: element.props.index,
      path: element.props.path,
      middleware: element.props.middleware,
      loader: element.props.loader,
      action: element.props.action,
      hydrateFallbackElement: element.props.hydrateFallbackElement,
      HydrateFallback: element.props.HydrateFallback,
      errorElement: element.props.errorElement,
      ErrorBoundary: element.props.ErrorBoundary,
      hasErrorBoundary: element.props.hasErrorBoundary === true || element.props.ErrorBoundary != null || element.props.errorElement != null,
      shouldRevalidate: element.props.shouldRevalidate,
      handle: element.props.handle,
      lazy: element.props.lazy
    };
    if (element.props.children) {
      route.children = createRoutesFromChildren(
        element.props.children,
        treePath
      );
    }
    routes.push(route);
  });
  return routes;
}
var defaultMethod = "get";
var defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return typeof HTMLElement !== "undefined" && object instanceof HTMLElement;
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
function createSearchParams(init = "") {
  return new URLSearchParams(
    typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo2, key) => {
      let value = init[key];
      return memo2.concat(
        Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
      );
    }, [])
  );
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);
  if (defaultSearchParams) {
    defaultSearchParams.forEach((_, key) => {
      if (!searchParams.has(key)) {
        defaultSearchParams.getAll(key).forEach((value) => {
          searchParams.append(key, value);
        });
      }
    });
  }
  return searchParams;
}
var _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
var supportedFormEncTypes = /* @__PURE__ */ new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    warning(
      false,
      `"${encType}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${defaultEncType}"`
    );
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error(
        `Cannot submit a <button> or <input type="submit"> without a <form>`
      );
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let { name, type, value } = target;
      if (type === "image") {
        let prefix = name ? `${name}.` : "";
        formData.append(`${prefix}x`, "0");
        formData.append(`${prefix}y`, "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error(
      `Cannot submit element that is not <form>, <button>, or <input type="submit|image">`
    );
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return { action, method: method.toLowerCase(), encType, formData, body };
}
await importShared('react');
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function invariant2(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function singleFetchUrl(reqUrl, basename, trailingSlashAware, extension) {
  let url = typeof reqUrl === "string" ? new URL(
    reqUrl,
    // This can be called during the SSR flow via PrefetchPageLinksImpl so
    // don't assume window is available
    typeof window === "undefined" ? "server://singlefetch/" : window.location.origin
  ) : reqUrl;
  if (trailingSlashAware) {
    if (url.pathname.endsWith("/")) {
      url.pathname = `${url.pathname}_.${extension}`;
    } else {
      url.pathname = `${url.pathname}.${extension}`;
    }
  } else {
    if (url.pathname === "/") {
      url.pathname = `_root.${extension}`;
    } else if (basename && stripBasename(url.pathname, basename) === "/") {
      url.pathname = `${basename.replace(/\/$/, "")}/_root.${extension}`;
    } else {
      url.pathname = `${url.pathname.replace(/\/$/, "")}.${extension}`;
    }
  }
  return url;
}
const React9 = await importShared('react');

const React8 = await importShared('react');

async function loadRouteModule(route, routeModulesCache) {
  if (route.id in routeModulesCache) {
    return routeModulesCache[route.id];
  }
  try {
    let routeModule = await import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      route.module
    );
    routeModulesCache[route.id] = routeModule;
    return routeModule;
  } catch (error) {
    console.error(
      `Error loading route module \`${route.module}\`, reloading page...`
    );
    console.error(error);
    if (window.__reactRouterContext && window.__reactRouterContext.isSpaMode && // @ts-expect-error
    void 0) ;
    window.location.reload();
    return new Promise(() => {
    });
  }
}
function isHtmlLinkDescriptor(object) {
  if (object == null) {
    return false;
  }
  if (object.href == null) {
    return object.rel === "preload" && typeof object.imageSrcSet === "string" && typeof object.imageSizes === "string";
  }
  return typeof object.rel === "string" && typeof object.href === "string";
}
async function getKeyedPrefetchLinks(matches, manifest, routeModules) {
  let links = await Promise.all(
    matches.map(async (match) => {
      let route = manifest.routes[match.route.id];
      if (route) {
        let mod = await loadRouteModule(route, routeModules);
        return mod.links ? mod.links() : [];
      }
      return [];
    })
  );
  return dedupeLinkDescriptors(
    links.flat(1).filter(isHtmlLinkDescriptor).filter((link) => link.rel === "stylesheet" || link.rel === "preload").map(
      (link) => link.rel === "stylesheet" ? { ...link, rel: "prefetch", as: "style" } : { ...link, rel: "prefetch" }
    )
  );
}
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
  let isNew = (match, index) => {
    if (!currentMatches[index]) return true;
    return match.route.id !== currentMatches[index].route.id;
  };
  let matchPathChanged = (match, index) => {
    return (
      // param change, /users/123 -> /users/456
      currentMatches[index].pathname !== match.pathname || // splat param changed, which is not present in match.path
      // e.g. /files/images/avatar.jpg -> files/finances.xls
      currentMatches[index].route.path?.endsWith("*") && currentMatches[index].params["*"] !== match.params["*"]
    );
  };
  if (mode === "assets") {
    return nextMatches.filter(
      (match, index) => isNew(match, index) || matchPathChanged(match, index)
    );
  }
  if (mode === "data") {
    return nextMatches.filter((match, index) => {
      let manifestRoute = manifest.routes[match.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return false;
      }
      if (isNew(match, index) || matchPathChanged(match, index)) {
        return true;
      }
      if (match.route.shouldRevalidate) {
        let routeChoice = match.route.shouldRevalidate({
          currentUrl: new URL(
            location.pathname + location.search + location.hash,
            window.origin
          ),
          currentParams: currentMatches[0]?.params || {},
          nextUrl: new URL(page, window.origin),
          nextParams: match.params,
          defaultShouldRevalidate: true
        });
        if (typeof routeChoice === "boolean") {
          return routeChoice;
        }
      }
      return true;
    });
  }
  return [];
}
function getModuleLinkHrefs(matches, manifest, { includeHydrateFallback } = {}) {
  return dedupeHrefs(
    matches.map((match) => {
      let route = manifest.routes[match.route.id];
      if (!route) return [];
      let hrefs = [route.module];
      if (route.clientActionModule) {
        hrefs = hrefs.concat(route.clientActionModule);
      }
      if (route.clientLoaderModule) {
        hrefs = hrefs.concat(route.clientLoaderModule);
      }
      if (includeHydrateFallback && route.hydrateFallbackModule) {
        hrefs = hrefs.concat(route.hydrateFallbackModule);
      }
      if (route.imports) {
        hrefs = hrefs.concat(route.imports);
      }
      return hrefs;
    }).flat(1)
  );
}
function dedupeHrefs(hrefs) {
  return [...new Set(hrefs)];
}
function sortKeys(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}
function dedupeLinkDescriptors(descriptors, preloads) {
  let set = /* @__PURE__ */ new Set();
  new Set(preloads);
  return descriptors.reduce((deduped, descriptor) => {
    let key = JSON.stringify(sortKeys(descriptor));
    if (!set.has(key)) {
      set.add(key);
      deduped.push({ key, link: descriptor });
    }
    return deduped;
  }, []);
}
await importShared('react');

await importShared('react');

await importShared('react');
function isFogOfWarEnabled(routeDiscovery, ssr) {
  return routeDiscovery.mode === "lazy" && ssr === true;
}
function getPartialManifest({ sri, ...manifest }, router) {
  let routeIds = new Set(router.state.matches.map((m) => m.route.id));
  let segments = router.state.location.pathname.split("/").filter(Boolean);
  let paths = ["/"];
  segments.pop();
  while (segments.length > 0) {
    paths.push(`/${segments.join("/")}`);
    segments.pop();
  }
  paths.forEach((path) => {
    let matches = matchRoutes(router.routes, path, router.basename);
    if (matches) {
      matches.forEach((m) => routeIds.add(m.route.id));
    }
  });
  let initialRoutes = [...routeIds].reduce(
    (acc, id) => Object.assign(acc, { [id]: manifest.routes[id] }),
    {}
  );
  return {
    ...manifest,
    routes: initialRoutes,
    sri: sri ? true : void 0
  };
}
function useDataRouterContext2() {
  let context = React8.useContext(DataRouterContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterContext.Provider> element"
  );
  return context;
}
function useDataRouterStateContext() {
  let context = React8.useContext(DataRouterStateContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  );
  return context;
}
var FrameworkContext = React8.createContext(void 0);
FrameworkContext.displayName = "FrameworkContext";
function useFrameworkContext() {
  let context = React8.useContext(FrameworkContext);
  invariant2(
    context,
    "You must render this element inside a <HydratedRouter> element"
  );
  return context;
}
function usePrefetchBehavior(prefetch, theirElementProps) {
  let frameworkContext = React8.useContext(FrameworkContext);
  let [maybePrefetch, setMaybePrefetch] = React8.useState(false);
  let [shouldPrefetch, setShouldPrefetch] = React8.useState(false);
  let { onFocus, onBlur, onMouseEnter, onMouseLeave, onTouchStart } = theirElementProps;
  let ref = React8.useRef(null);
  React8.useEffect(() => {
    if (prefetch === "render") {
      setShouldPrefetch(true);
    }
    if (prefetch === "viewport") {
      let callback = (entries) => {
        entries.forEach((entry) => {
          setShouldPrefetch(entry.isIntersecting);
        });
      };
      let observer = new IntersectionObserver(callback, { threshold: 0.5 });
      if (ref.current) observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [prefetch]);
  React8.useEffect(() => {
    if (maybePrefetch) {
      let id = setTimeout(() => {
        setShouldPrefetch(true);
      }, 100);
      return () => {
        clearTimeout(id);
      };
    }
  }, [maybePrefetch]);
  let setIntent = () => {
    setMaybePrefetch(true);
  };
  let cancelIntent = () => {
    setMaybePrefetch(false);
    setShouldPrefetch(false);
  };
  if (!frameworkContext) {
    return [false, ref, {}];
  }
  if (prefetch !== "intent") {
    return [shouldPrefetch, ref, {}];
  }
  return [
    shouldPrefetch,
    ref,
    {
      onFocus: composeEventHandlers$1(onFocus, setIntent),
      onBlur: composeEventHandlers$1(onBlur, cancelIntent),
      onMouseEnter: composeEventHandlers$1(onMouseEnter, setIntent),
      onMouseLeave: composeEventHandlers$1(onMouseLeave, cancelIntent),
      onTouchStart: composeEventHandlers$1(onTouchStart, setIntent)
    }
  ];
}
function composeEventHandlers$1(theirHandler, ourHandler) {
  return (event) => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}
function getActiveMatches(matches, errors, isSpaMode) {
  if (isSpaMode && !isHydrated) {
    return [matches[0]];
  }
  return matches;
}
function PrefetchPageLinks({ page, ...linkProps }) {
  let { router } = useDataRouterContext2();
  let matches = React8.useMemo(
    () => matchRoutes(router.routes, page, router.basename),
    [router.routes, page, router.basename]
  );
  if (!matches) {
    return null;
  }
  return /* @__PURE__ */ React8.createElement(PrefetchPageLinksImpl, { page, matches, ...linkProps });
}
function useKeyedPrefetchLinks(matches) {
  let { manifest, routeModules } = useFrameworkContext();
  let [keyedPrefetchLinks, setKeyedPrefetchLinks] = React8.useState([]);
  React8.useEffect(() => {
    let interrupted = false;
    void getKeyedPrefetchLinks(matches, manifest, routeModules).then(
      (links) => {
        if (!interrupted) {
          setKeyedPrefetchLinks(links);
        }
      }
    );
    return () => {
      interrupted = true;
    };
  }, [matches, manifest, routeModules]);
  return keyedPrefetchLinks;
}
function PrefetchPageLinksImpl({
  page,
  matches: nextMatches,
  ...linkProps
}) {
  let location = useLocation();
  let { future, manifest, routeModules } = useFrameworkContext();
  let { basename } = useDataRouterContext2();
  let { loaderData, matches } = useDataRouterStateContext();
  let newMatchesForData = React8.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "data"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let newMatchesForAssets = React8.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "assets"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let dataHrefs = React8.useMemo(() => {
    if (page === location.pathname + location.search + location.hash) {
      return [];
    }
    let routesParams = /* @__PURE__ */ new Set();
    let foundOptOutRoute = false;
    nextMatches.forEach((m) => {
      let manifestRoute = manifest.routes[m.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return;
      }
      if (!newMatchesForData.some((m2) => m2.route.id === m.route.id) && m.route.id in loaderData && routeModules[m.route.id]?.shouldRevalidate) {
        foundOptOutRoute = true;
      } else if (manifestRoute.hasClientLoader) {
        foundOptOutRoute = true;
      } else {
        routesParams.add(m.route.id);
      }
    });
    if (routesParams.size === 0) {
      return [];
    }
    let url = singleFetchUrl(
      page,
      basename,
      future.unstable_trailingSlashAwareDataRequests,
      "data"
    );
    if (foundOptOutRoute && routesParams.size > 0) {
      url.searchParams.set(
        "_routes",
        nextMatches.filter((m) => routesParams.has(m.route.id)).map((m) => m.route.id).join(",")
      );
    }
    return [url.pathname + url.search];
  }, [
    basename,
    future.unstable_trailingSlashAwareDataRequests,
    loaderData,
    location,
    manifest,
    newMatchesForData,
    nextMatches,
    page,
    routeModules
  ]);
  let moduleHrefs = React8.useMemo(
    () => getModuleLinkHrefs(newMatchesForAssets, manifest),
    [newMatchesForAssets, manifest]
  );
  let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, dataHrefs.map((href) => /* @__PURE__ */ React8.createElement("link", { key: href, rel: "prefetch", as: "fetch", href, ...linkProps })), moduleHrefs.map((href) => /* @__PURE__ */ React8.createElement("link", { key: href, rel: "modulepreload", href, ...linkProps })), keyedPrefetchLinks.map(({ key, link }) => (
    // these don't spread `linkProps` because they are full link descriptors
    // already with their own props
    /* @__PURE__ */ React8.createElement(
      "link",
      {
        key,
        nonce: linkProps.nonce,
        ...link,
        crossOrigin: link.crossOrigin ?? linkProps.crossOrigin
      }
    )
  )));
}
var isHydrated = false;
function setIsHydrated() {
  isHydrated = true;
}
function Scripts(scriptProps) {
  let {
    manifest,
    serverHandoffString,
    isSpaMode,
    renderMeta,
    routeDiscovery,
    ssr
  } = useFrameworkContext();
  let { router, static: isStatic, staticContext } = useDataRouterContext2();
  let { matches: routerMatches } = useDataRouterStateContext();
  let isRSCRouterContext = useIsRSCRouterContext();
  let enableFogOfWar = isFogOfWarEnabled(routeDiscovery, ssr);
  if (renderMeta) {
    renderMeta.didRenderScripts = true;
  }
  let matches = getActiveMatches(routerMatches, null, isSpaMode);
  React8.useEffect(() => {
    setIsHydrated();
  }, []);
  let initialScripts = React8.useMemo(() => {
    if (isRSCRouterContext) {
      return null;
    }
    let streamScript = "window.__reactRouterContext.stream = new ReadableStream({start(controller){window.__reactRouterContext.streamController = controller;}}).pipeThrough(new TextEncoderStream());";
    let contextScript = staticContext ? `window.__reactRouterContext = ${serverHandoffString};${streamScript}` : " ";
    let routeModulesScript = !isStatic ? " " : `${manifest.hmr?.runtime ? `import ${JSON.stringify(manifest.hmr.runtime)};` : ""}${!enableFogOfWar ? `import ${JSON.stringify(manifest.url)}` : ""};
${matches.map((match, routeIndex) => {
      let routeVarName = `route${routeIndex}`;
      let manifestEntry = manifest.routes[match.route.id];
      invariant2(manifestEntry, `Route ${match.route.id} not found in manifest`);
      let {
        clientActionModule,
        clientLoaderModule,
        clientMiddlewareModule,
        hydrateFallbackModule,
        module
      } = manifestEntry;
      let chunks = [
        ...clientActionModule ? [
          {
            module: clientActionModule,
            varName: `${routeVarName}_clientAction`
          }
        ] : [],
        ...clientLoaderModule ? [
          {
            module: clientLoaderModule,
            varName: `${routeVarName}_clientLoader`
          }
        ] : [],
        ...clientMiddlewareModule ? [
          {
            module: clientMiddlewareModule,
            varName: `${routeVarName}_clientMiddleware`
          }
        ] : [],
        ...hydrateFallbackModule ? [
          {
            module: hydrateFallbackModule,
            varName: `${routeVarName}_HydrateFallback`
          }
        ] : [],
        { module, varName: `${routeVarName}_main` }
      ];
      if (chunks.length === 1) {
        return `import * as ${routeVarName} from ${JSON.stringify(module)};`;
      }
      let chunkImportsSnippet = chunks.map((chunk) => `import * as ${chunk.varName} from "${chunk.module}";`).join("\n");
      let mergedChunksSnippet = `const ${routeVarName} = {${chunks.map((chunk) => `...${chunk.varName}`).join(",")}};`;
      return [chunkImportsSnippet, mergedChunksSnippet].join("\n");
    }).join("\n")}
  ${enableFogOfWar ? (
      // Inline a minimal manifest with the SSR matches
      `window.__reactRouterManifest = ${JSON.stringify(
        getPartialManifest(manifest, router),
        null,
        2
      )};`
    ) : ""}
  window.__reactRouterRouteModules = {${matches.map((match, index) => `${JSON.stringify(match.route.id)}:route${index}`).join(",")}};

import(${JSON.stringify(manifest.entry.module)});`;
    return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(
      "script",
      {
        ...scriptProps,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: { __html: contextScript },
        type: void 0
      }
    ), /* @__PURE__ */ React8.createElement(
      "script",
      {
        ...scriptProps,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: { __html: routeModulesScript },
        type: "module",
        async: true
      }
    ));
  }, []);
  let preloads = isHydrated || isRSCRouterContext ? [] : dedupe(
    manifest.entry.imports.concat(
      getModuleLinkHrefs(matches, manifest, {
        includeHydrateFallback: true
      })
    )
  );
  let sri = typeof manifest.sri === "object" ? manifest.sri : {};
  warnOnce(
    !isRSCRouterContext,
    "The <Scripts /> element is a no-op when using RSC and can be safely removed."
  );
  return isHydrated || isRSCRouterContext ? null : /* @__PURE__ */ React8.createElement(React8.Fragment, null, typeof manifest.sri === "object" ? /* @__PURE__ */ React8.createElement(
    "script",
    {
      ...scriptProps,
      "rr-importmap": "",
      type: "importmap",
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: {
        __html: JSON.stringify({
          integrity: sri
        })
      }
    }
  ) : null, !enableFogOfWar ? /* @__PURE__ */ React8.createElement(
    "link",
    {
      rel: "modulepreload",
      href: manifest.url,
      crossOrigin: scriptProps.crossOrigin,
      integrity: sri[manifest.url],
      suppressHydrationWarning: true
    }
  ) : null, /* @__PURE__ */ React8.createElement(
    "link",
    {
      rel: "modulepreload",
      href: manifest.entry.module,
      crossOrigin: scriptProps.crossOrigin,
      integrity: sri[manifest.entry.module],
      suppressHydrationWarning: true
    }
  ), preloads.map((path) => /* @__PURE__ */ React8.createElement(
    "link",
    {
      key: path,
      rel: "modulepreload",
      href: path,
      crossOrigin: scriptProps.crossOrigin,
      integrity: sri[path],
      suppressHydrationWarning: true
    }
  )), initialScripts);
}
function dedupe(array) {
  return [...new Set(array)];
}
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
(class extends React9.Component {
  constructor(props) {
    super(props);
    this.state = { error: props.error || null, location: props.location };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location) {
      return { error: props.error || null, location: props.location };
    }
    return { error: props.error || state.error, location: state.location };
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ React9.createElement(
        RemixRootDefaultErrorBoundary,
        {
          error: this.state.error,
          isOutsideRemixApp: true
        }
      );
    } else {
      return this.props.children;
    }
  }
});
function RemixRootDefaultErrorBoundary({
  error,
  isOutsideRemixApp
}) {
  console.error(error);
  let heyDeveloper = /* @__PURE__ */ React9.createElement(
    "script",
    {
      dangerouslySetInnerHTML: {
        __html: `
        console.log(
          "💿 Hey developer 👋. You can provide a way better UX than this when your app throws errors. Check out https://reactrouter.com/how-to/error-boundary for more information."
        );
      `
      }
    }
  );
  if (isRouteErrorResponse(error)) {
    return /* @__PURE__ */ React9.createElement(BoundaryShell, { title: "Unhandled Thrown Response!" }, /* @__PURE__ */ React9.createElement("h1", { style: { fontSize: "24px" } }, error.status, " ", error.statusText), heyDeveloper );
  }
  let errorInstance;
  if (error instanceof Error) {
    errorInstance = error;
  } else {
    let errorString = error == null ? "Unknown Error" : typeof error === "object" && "toString" in error ? error.toString() : JSON.stringify(error);
    errorInstance = new Error(errorString);
  }
  return /* @__PURE__ */ React9.createElement(
    BoundaryShell,
    {
      title: "Application Error!",
      isOutsideRemixApp
    },
    /* @__PURE__ */ React9.createElement("h1", { style: { fontSize: "24px" } }, "Application Error"),
    /* @__PURE__ */ React9.createElement(
      "pre",
      {
        style: {
          padding: "2rem",
          background: "hsla(10, 50%, 50%, 0.1)",
          color: "red",
          overflow: "auto"
        }
      },
      errorInstance.stack
    ),
    heyDeveloper
  );
}
function BoundaryShell({
  title,
  renderScripts,
  isOutsideRemixApp,
  children
}) {
  let { routeModules } = useFrameworkContext();
  if (routeModules.root?.Layout && !isOutsideRemixApp) {
    return children;
  }
  return /* @__PURE__ */ React9.createElement("html", { lang: "en" }, /* @__PURE__ */ React9.createElement("head", null, /* @__PURE__ */ React9.createElement("meta", { charSet: "utf-8" }), /* @__PURE__ */ React9.createElement(
    "meta",
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1,viewport-fit=cover"
    }
  ), /* @__PURE__ */ React9.createElement("title", null, title)), /* @__PURE__ */ React9.createElement("body", null, /* @__PURE__ */ React9.createElement("main", { style: { fontFamily: "system-ui, sans-serif", padding: "2rem" } }, children, renderScripts ? /* @__PURE__ */ React9.createElement(Scripts, null) : null)));
}
const React10 = await importShared('react');

var isBrowser2 = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
try {
  if (isBrowser2) {
    window.__reactRouterVersion = // @ts-expect-error
    "7.13.0";
  }
} catch (e) {
}
function HashRouter({
  basename,
  children,
  unstable_useTransitions,
  window: window2
}) {
  let historyRef = React10.useRef();
  if (historyRef.current == null) {
    historyRef.current = createHashHistory({ window: window2, v5Compat: true });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = React10.useState({
    action: history.action,
    location: history.location
  });
  let setState = React10.useCallback(
    (newState) => {
      if (unstable_useTransitions === false) {
        setStateImpl(newState);
      } else {
        React10.startTransition(() => setStateImpl(newState));
      }
    },
    [unstable_useTransitions]
  );
  React10.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /* @__PURE__ */ React10.createElement(
    Router,
    {
      basename,
      children,
      location: state.location,
      navigationType: state.action,
      navigator: history,
      unstable_useTransitions
    }
  );
}
var ABSOLUTE_URL_REGEX2 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var Link = React10.forwardRef(
  function LinkWithRef({
    onClick,
    discover = "render",
    prefetch = "none",
    relative,
    reloadDocument,
    replace: replace2,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition,
    unstable_defaultShouldRevalidate,
    ...rest
  }, forwardedRef) {
    let { basename, unstable_useTransitions } = React10.useContext(NavigationContext);
    let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX2.test(to);
    let parsed = parseToInfo(to, basename);
    to = parsed.to;
    let href = useHref(to, { relative });
    let [shouldPrefetch, prefetchRef, prefetchHandlers] = usePrefetchBehavior(
      prefetch,
      rest
    );
    let internalOnClick = useLinkClickHandler(to, {
      replace: replace2,
      state,
      target,
      preventScrollReset,
      relative,
      viewTransition,
      unstable_defaultShouldRevalidate,
      unstable_useTransitions
    });
    function handleClick(event) {
      if (onClick) onClick(event);
      if (!event.defaultPrevented) {
        internalOnClick(event);
      }
    }
    let link = (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      /* @__PURE__ */ React10.createElement(
        "a",
        {
          ...rest,
          ...prefetchHandlers,
          href: parsed.absoluteURL || href,
          onClick: parsed.isExternal || reloadDocument ? onClick : handleClick,
          ref: mergeRefs(forwardedRef, prefetchRef),
          target,
          "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
        }
      )
    );
    return shouldPrefetch && !isAbsolute ? /* @__PURE__ */ React10.createElement(React10.Fragment, null, link, /* @__PURE__ */ React10.createElement(PrefetchPageLinks, { page: href })) : link;
  }
);
Link.displayName = "Link";
var NavLink = React10.forwardRef(
  function NavLinkWithRef({
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children,
    ...rest
  }, ref) {
    let path = useResolvedPath(to, { relative: rest.relative });
    let location = useLocation();
    let routerState = React10.useContext(DataRouterStateContext);
    let { navigator, basename } = React10.useContext(NavigationContext);
    let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useViewTransitionState(path) && viewTransition === true;
    let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
    let locationPathname = location.pathname;
    let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
    if (!caseSensitive) {
      locationPathname = locationPathname.toLowerCase();
      nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
      toPathname = toPathname.toLowerCase();
    }
    if (nextLocationPathname && basename) {
      nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
    }
    const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
    let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
    let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
    let renderProps = {
      isActive,
      isPending,
      isTransitioning
    };
    let ariaCurrent = isActive ? ariaCurrentProp : void 0;
    let className;
    if (typeof classNameProp === "function") {
      className = classNameProp(renderProps);
    } else {
      className = [
        classNameProp,
        isActive ? "active" : null,
        isPending ? "pending" : null,
        isTransitioning ? "transitioning" : null
      ].filter(Boolean).join(" ");
    }
    let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
    return /* @__PURE__ */ React10.createElement(
      Link,
      {
        ...rest,
        "aria-current": ariaCurrent,
        className,
        ref,
        style,
        to,
        viewTransition
      },
      typeof children === "function" ? children(renderProps) : children
    );
  }
);
NavLink.displayName = "NavLink";
var Form = React10.forwardRef(
  ({
    discover = "render",
    fetcherKey,
    navigate,
    reloadDocument,
    replace: replace2,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    viewTransition,
    unstable_defaultShouldRevalidate,
    ...props
  }, forwardedRef) => {
    let { unstable_useTransitions } = React10.useContext(NavigationContext);
    let submit = useSubmit();
    let formAction = useFormAction(action, { relative });
    let formMethod = method.toLowerCase() === "get" ? "get" : "post";
    let isAbsolute = typeof action === "string" && ABSOLUTE_URL_REGEX2.test(action);
    let submitHandler = (event) => {
      onSubmit && onSubmit(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      let submitter = event.nativeEvent.submitter;
      let submitMethod = submitter?.getAttribute("formmethod") || method;
      let doSubmit = () => submit(submitter || event.currentTarget, {
        fetcherKey,
        method: submitMethod,
        navigate,
        replace: replace2,
        state,
        relative,
        preventScrollReset,
        viewTransition,
        unstable_defaultShouldRevalidate
      });
      if (unstable_useTransitions && navigate !== false) {
        React10.startTransition(() => doSubmit());
      } else {
        doSubmit();
      }
    };
    return /* @__PURE__ */ React10.createElement(
      "form",
      {
        ref: forwardedRef,
        method: formMethod,
        action: formAction,
        onSubmit: reloadDocument ? onSubmit : submitHandler,
        ...props,
        "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
      }
    );
  }
);
Form.displayName = "Form";
function getDataRouterConsoleError2(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext3(hookName) {
  let ctx = React10.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError2(hookName));
  return ctx;
}
function useLinkClickHandler(to, {
  target,
  replace: replaceProp,
  state,
  preventScrollReset,
  relative,
  viewTransition,
  unstable_defaultShouldRevalidate,
  unstable_useTransitions
} = {}) {
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, { relative });
  return React10.useCallback(
    (event) => {
      if (shouldProcessLinkClick(event, target)) {
        event.preventDefault();
        let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
        let doNavigate = () => navigate(to, {
          replace: replace2,
          state,
          preventScrollReset,
          relative,
          viewTransition,
          unstable_defaultShouldRevalidate
        });
        if (unstable_useTransitions) {
          React10.startTransition(() => doNavigate());
        } else {
          doNavigate();
        }
      }
    },
    [
      location,
      navigate,
      path,
      replaceProp,
      state,
      target,
      to,
      preventScrollReset,
      relative,
      viewTransition,
      unstable_defaultShouldRevalidate,
      unstable_useTransitions
    ]
  );
}
function useSearchParams(defaultInit) {
  warning(
    typeof URLSearchParams !== "undefined",
    `You cannot use the \`useSearchParams\` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.`
  );
  let defaultSearchParamsRef = React10.useRef(createSearchParams(defaultInit));
  let hasSetSearchParamsRef = React10.useRef(false);
  let location = useLocation();
  let searchParams = React10.useMemo(
    () => (
      // Only merge in the defaults if we haven't yet called setSearchParams.
      // Once we call that we want those to take precedence, otherwise you can't
      // remove a param with setSearchParams({}) if it has an initial value
      getSearchParamsForLocation(
        location.search,
        hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current
      )
    ),
    [location.search]
  );
  let navigate = useNavigate();
  let setSearchParams = React10.useCallback(
    (nextInit, navigateOptions) => {
      const newSearchParams = createSearchParams(
        typeof nextInit === "function" ? nextInit(new URLSearchParams(searchParams)) : nextInit
      );
      hasSetSearchParamsRef.current = true;
      navigate("?" + newSearchParams, navigateOptions);
    },
    [navigate, searchParams]
  );
  return [searchParams, setSearchParams];
}
var fetcherId = 0;
var getUniqueFetcherId = () => `__${String(++fetcherId)}__`;
function useSubmit() {
  let { router } = useDataRouterContext3(
    "useSubmit"
    /* UseSubmit */
  );
  let { basename } = React10.useContext(NavigationContext);
  let currentRouteId = useRouteId();
  let routerFetch = router.fetch;
  let routerNavigate = router.navigate;
  return React10.useCallback(
    async (target, options = {}) => {
      let { action, method, encType, formData, body } = getFormSubmissionInfo(
        target,
        basename
      );
      if (options.navigate === false) {
        let key = options.fetcherKey || getUniqueFetcherId();
        await routerFetch(key, currentRouteId, options.action || action, {
          unstable_defaultShouldRevalidate: options.unstable_defaultShouldRevalidate,
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          flushSync: options.flushSync
        });
      } else {
        await routerNavigate(options.action || action, {
          unstable_defaultShouldRevalidate: options.unstable_defaultShouldRevalidate,
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          replace: options.replace,
          state: options.state,
          fromRouteId: currentRouteId,
          flushSync: options.flushSync,
          viewTransition: options.viewTransition
        });
      }
    },
    [routerFetch, routerNavigate, basename, currentRouteId]
  );
}
function useFormAction(action, { relative } = {}) {
  let { basename } = React10.useContext(NavigationContext);
  let routeContext = React10.useContext(RouteContext);
  invariant(routeContext, "useFormAction must be used inside a RouteContext");
  let [match] = routeContext.matches.slice(-1);
  let path = { ...useResolvedPath(action ? action : ".", { relative }) };
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    let indexValues = params.getAll("index");
    let hasNakedIndexParam = indexValues.some((v) => v === "");
    if (hasNakedIndexParam) {
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? `?${qs}` : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
function useViewTransitionState(to, { relative } = {}) {
  let vtContext = React10.useContext(ViewTransitionContext);
  invariant(
    vtContext != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?"
  );
  let { basename } = useDataRouterContext3(
    "useViewTransitionState"
    /* useViewTransitionState */
  );
  let path = useResolvedPath(to, { relative });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}
await importShared('react');

const numLogo = "/microfrontends/module-teacher/dist/num_logo.png";

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase$1 = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase$1(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const {forwardRef: forwardRef$1,createElement: createElement$1} = await importShared('react');

const Icon = forwardRef$1(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => {
    return createElement$1(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: mergeClasses("lucide", className),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement$1(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const {forwardRef,createElement} = await importShared('react');

const createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef(
    ({ className, ...props }, ref) => createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$E = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$E);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$D = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$D);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$C = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode$C);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$B = [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
];
const Award = createLucideIcon("award", __iconNode$B);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$A = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
const Bell = createLucideIcon("bell", __iconNode$A);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$z = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
];
const BookOpen = createLucideIcon("book-open", __iconNode$z);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$y = [
  ["path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z", key: "1fy3hk" }]
];
const Bookmark = createLucideIcon("bookmark", __iconNode$y);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$x = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
];
const CalendarDays = createLucideIcon("calendar-days", __iconNode$x);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$w = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$w);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$v = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$v);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$u = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$u);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$t = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode$t);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$s = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$s);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$r = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode$r);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$q = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$q);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$p = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$p);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$o = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
];
const Clock = createLucideIcon("clock", __iconNode$o);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$n = [
  ["rect", { x: "2", y: "6", width: "20", height: "8", rx: "1", key: "1estib" }],
  ["path", { d: "M17 14v7", key: "7m2elx" }],
  ["path", { d: "M7 14v7", key: "1cm7wv" }],
  ["path", { d: "M17 3v3", key: "1v4jwn" }],
  ["path", { d: "M7 3v3", key: "7o6guu" }],
  ["path", { d: "M10 14 2.3 6.3", key: "1023jk" }],
  ["path", { d: "m14 6 7.7 7.7", key: "1s8pl2" }],
  ["path", { d: "m8 6 8 8", key: "hl96qh" }]
];
const Construction = createLucideIcon("construction", __iconNode$n);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$m = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
  ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]
];
const EllipsisVertical = createLucideIcon("ellipsis-vertical", __iconNode$m);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$l = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode$l);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$k = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m9 15 2 2 4-4", key: "1grp1n" }]
];
const FileCheck = createLucideIcon("file-check", __iconNode$k);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$j = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "m9 15 3 3 3-3", key: "1npd3o" }]
];
const FileDown = createLucideIcon("file-down", __iconNode$j);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$i = [
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  [
    "path",
    { d: "M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3", key: "ms7g94" }
  ],
  ["path", { d: "m9 18-1.5-1.5", key: "1j6qii" }],
  ["circle", { cx: "5", cy: "14", r: "3", key: "ufru5t" }]
];
const FileSearch = createLucideIcon("file-search", __iconNode$i);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$h = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$h);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$g = [
  [
    "path",
    {
      d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
      key: "sc7q7i"
    }
  ]
];
const Funnel = createLucideIcon("funnel", __iconNode$g);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$f = [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "1d0kgt"
    }
  ]
];
const House = createLucideIcon("house", __iconNode$f);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$e = [
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }],
  ["polyline", { points: "16 17 21 12 16 7", key: "1gabdz" }],
  ["line", { x1: "21", x2: "9", y1: "12", y2: "12", key: "1uyos4" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$e);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$d = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$d);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$c = [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$c);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$b = [
  ["path", { d: "M13.234 20.252 21 12.3", key: "1cbrk9" }],
  [
    "path",
    {
      d: "m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486",
      key: "1pkts6"
    }
  ]
];
const Paperclip = createLucideIcon("paperclip", __iconNode$b);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$a = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$a);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$9 = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
];
const Search = createLucideIcon("search", __iconNode$9);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$8 = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode$8);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$7 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
];
const ShieldAlert = createLucideIcon("shield-alert", __iconNode$7);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$6 = [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode$6);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$5 = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode$5);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$4 = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode$4);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$3 = [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode$3);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$2 = [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
];
const Upload = createLucideIcon("upload", __iconNode$2);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }]
];
const Users = createLucideIcon("users", __iconNode$1);

/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);

const STORAGE_KEY = "mauth_current_user";
function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function guardRoute(requiredRole) {
  const user = getStoredUser();
  if (!user) {
    window.location.replace("/login.xhtml");
    return null;
  }
  if (user.role !== requiredRole) {
    const redirectMap = {
      admin: "/admin.xhtml",
      teacher: "/teacher.xhtml",
      student: "/student.xhtml"
    };
    window.location.replace(redirectMap[user.role]);
    return null;
  }
  return user;
}
function logout() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  window.location.replace("/login.xhtml");
}

const BASE_MENU = [
  { icon: House, label: "Хянах самбар", path: "/teacher", end: true },
  { icon: FileSearch, label: "Судалгааны удирдлага", path: "/teacher/thesis" },
  { icon: Users, label: "Оюутнууд", path: "/teacher/students" },
  { icon: TrendingUp, label: "Явцын хяналт", path: "/teacher/progress" },
  { icon: CircleCheckBig, label: "Комисс", path: "/teacher/committee" }
];
function TeacherSidebar({ collapsed }) {
  const user = getStoredUser();
  const isExpert = user?.systemRole === "EXTERNAL_EXPERT";
  const menuItems = isExpert ? [{ icon: Award, label: "Гадаад эксперт үнэлгээ", path: "/teacher/expert", end: true }] : BASE_MENU;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "aside",
    {
      className: `relative flex flex-col bg-ink-900 border-r border-black/20 transition-[width] duration-300 ${collapsed ? "w-20" : "w-64"} shrink-0`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-5 h-16 border-b border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: numLogo,
              alt: "МУИС",
              width: 26,
              height: 26,
              className: "shrink-0 opacity-90 [filter:brightness(0)_invert(1)]"
            }
          ),
          !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] font-semibold tracking-tight text-white leading-none", children: "МУИС" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-white/50 mt-1 leading-snug", children: [
              "Дипломын ажлын",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "удирдлагын систем"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex-1 py-5 overflow-y-auto", children: [
          !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-5 mb-2 text-[10px] uppercase tracking-[0.14em] font-medium text-white/35", children: "Үндсэн цэс" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-px", children: menuItems.map((item) => {
            const Icon = item.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLink,
              {
                to: item.path,
                end: item.end,
                className: ({ isActive }) => `group relative flex items-center gap-3 h-9 px-5 transition-colors ${collapsed ? "justify-center px-0" : ""} ${isActive ? "text-white bg-white/[0.07]" : "text-white/55 hover:text-white hover:bg-white/[0.04]"}`,
                children: ({ isActive }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  isActive && !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 top-0 bottom-0 w-[2px] bg-accent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Icon,
                    {
                      className: `w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : "text-white/45 group-hover:text-white/80"}`,
                      strokeWidth: 1.6
                    }
                  ),
                  !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[13px] tracking-tight ${isActive ? "font-medium" : "font-normal"}`, children: item.label })
                ] })
              },
              item.path
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-3 border-t border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: `w-full flex items-center gap-3 h-9 text-white/55 hover:text-white transition-colors ${collapsed ? "justify-center" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-[18px] h-[18px] shrink-0", strokeWidth: 1.6 }),
              !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] tracking-tight", children: "Мэдэгдэл" })
            ]
          }
        ) })
      ]
    }
  );
}

/**
 * Create a bound version of a function with a specified `this` context
 *
 * @param {Function} fn - The function to bind
 * @param {*} thisArg - The value to be passed as the `this` parameter
 * @returns {Function} A new function that will call the original function with the specified `this` context
 */
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// utils is a library of generic helper functions non-specific to axios

const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;

const kindOf = ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));

const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};

const typeOfTest = (type) => (thing) => typeof thing === type;

/**
 * Determine if a value is a non-null object
 *
 * @param {Object} val The value to test
 *
 * @returns {boolean} True if value is an Array, otherwise false
 */
const { isArray } = Array;

/**
 * Determine if a value is undefined
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if the value is undefined, otherwise false
 */
const isUndefined = typeOfTest('undefined');

/**
 * Determine if a value is a Buffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return (
    val !== null &&
    !isUndefined(val) &&
    val.constructor !== null &&
    !isUndefined(val.constructor) &&
    isFunction$1(val.constructor.isBuffer) &&
    val.constructor.isBuffer(val)
  );
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
const isArrayBuffer = kindOfTest('ArrayBuffer');

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a String, otherwise false
 */
const isString = typeOfTest('string');

/**
 * Determine if a value is a Function
 *
 * @param {*} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
const isFunction$1 = typeOfTest('function');

/**
 * Determine if a value is a Number
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Number, otherwise false
 */
const isNumber$1 = typeOfTest('number');

/**
 * Determine if a value is an Object
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an Object, otherwise false
 */
const isObject = (thing) => thing !== null && typeof thing === 'object';

/**
 * Determine if a value is a Boolean
 *
 * @param {*} thing The value to test
 * @returns {boolean} True if value is a Boolean, otherwise false
 */
const isBoolean = (thing) => thing === true || thing === false;

/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */
const isPlainObject = (val) => {
  if (kindOf(val) !== 'object') {
    return false;
  }

  const prototype = getPrototypeOf(val);
  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(toStringTag in val) &&
    !(iterator in val)
  );
};

/**
 * Determine if a value is an empty object (safely handles Buffers)
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an empty object, otherwise false
 */
const isEmptyObject = (val) => {
  // Early return for non-objects or Buffers to prevent RangeError
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }

  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    // Fallback for any other objects that might cause RangeError with Object.keys()
    return false;
  }
};

/**
 * Determine if a value is a Date
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Date, otherwise false
 */
const isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFile = kindOfTest('File');

/**
 * Determine if a value is a React Native Blob
 * React Native "blob": an object with a `uri` attribute. Optionally, it can
 * also have a `name` and `type` attribute to specify filename and content type
 *
 * @see https://github.com/facebook/react-native/blob/26684cf3adf4094eb6c405d345a75bf8c7c0bf88/Libraries/Network/FormData.js#L68-L71
 * 
 * @param {*} value The value to test
 * 
 * @returns {boolean} True if value is a React Native Blob, otherwise false
 */
const isReactNativeBlob = (value) => {
  return !!(value && typeof value.uri !== 'undefined');
};

/**
 * Determine if environment is React Native
 * ReactNative `FormData` has a non-standard `getParts()` method
 * 
 * @param {*} formData The formData to test
 * 
 * @returns {boolean} True if environment is React Native, otherwise false
 */
const isReactNative = (formData) => formData && typeof formData.getParts !== 'undefined';

/**
 * Determine if a value is a Blob
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Blob, otherwise false
 */
const isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Stream
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Stream, otherwise false
 */
const isStream = (val) => isObject(val) && isFunction$1(val.pipe);

/**
 * Determine if a value is a FormData
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function getGlobal() {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  return {};
}

const G = getGlobal();
const FormDataCtor = typeof G.FormData !== 'undefined' ? G.FormData : undefined;

const isFormData = (thing) => {
  let kind;
  return thing && (
    (FormDataCtor && thing instanceof FormDataCtor) || (
      isFunction$1(thing.append) && (
        (kind = kindOf(thing)) === 'formdata' ||
        // detect form-data instance
        (kind === 'object' && isFunction$1(thing.toString) && thing.toString() === '[object FormData]')
      )
    )
  );
};

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
const isURLSearchParams = kindOfTest('URLSearchParams');

const [isReadableStream, isRequest, isResponse, isHeaders] = [
  'ReadableStream',
  'Request',
  'Response',
  'Headers',
].map(kindOfTest);

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 *
 * @returns {String} The String freed of excess whitespace
 */
const trim = (str) => {
  return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};
/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array<unknown>} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 *
 * @param {Object} [options]
 * @param {Boolean} [options.allOwnKeys = false]
 * @returns {any}
 */
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  let i;
  let l;

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Buffer check
    if (isBuffer(obj)) {
      return;
    }

    // Iterate over object keys
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;

    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}

/**
 * Finds a key in an object, case-insensitive, returning the actual key name.
 * Returns null if the object is a Buffer or if no match is found.
 *
 * @param {Object} obj - The object to search.
 * @param {string} key - The key to find (case-insensitive).
 * @returns {?string} The actual key name if found, otherwise null.
 */
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }

  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}

const _global = (() => {
  /*eslint no-undef:0*/
  if (typeof globalThis !== 'undefined') return globalThis;
  return typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;
})();

const isContextDefined = (context) => !isUndefined(context) && context !== _global;

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * const result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 *
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  const { caseless, skipUndefined } = (isContextDefined(this) && this) || {};
  const result = {};
  const assignValue = (val, key) => {
    // Skip dangerous property names to prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return;
    }

    const targetKey = (caseless && findKey(result, key)) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };

  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 *
 * @param {Object} [options]
 * @param {Boolean} [options.allOwnKeys]
 * @returns {Object} The resulting value of object a
 */
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(
    b,
    (val, key) => {
      if (thisArg && isFunction$1(val)) {
        Object.defineProperty(a, key, {
          value: bind(val, thisArg),
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        Object.defineProperty(a, key, {
          value: val,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    },
    { allOwnKeys }
  );
  return a;
};

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 *
 * @returns {string} content value without BOM
 */
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return content;
};

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 *
 * @returns {void}
 */
const inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  Object.defineProperty(constructor.prototype, 'constructor', {
    value: constructor,
    writable: true,
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(constructor, 'super', {
    value: superConstructor.prototype,
  });
  props && Object.assign(constructor.prototype, props);
};

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function|Boolean} [filter]
 * @param {Function} [propFilter]
 *
 * @returns {Object}
 */
const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};

  destObj = destObj || {};
  // eslint-disable-next-line no-eq-null,eqeqeq
  if (sourceObj == null) return destObj;

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
};

/**
 * Determines whether a string ends with the characters of a specified string
 *
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 *
 * @returns {boolean}
 */
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};

/**
 * Returns new array from array like object or null if failed
 *
 * @param {*} [thing]
 *
 * @returns {?Array}
 */
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber$1(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};

/**
 * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
 * thing passed in is an instance of Uint8Array
 *
 * @param {TypedArray}
 *
 * @returns {Array}
 */
// eslint-disable-next-line func-names
const isTypedArray = ((TypedArray) => {
  // eslint-disable-next-line func-names
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

/**
 * For each entry in the object, call the function with the key and value.
 *
 * @param {Object<any, any>} obj - The object to iterate over.
 * @param {Function} fn - The function to call for each entry.
 *
 * @returns {void}
 */
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];

  const _iterator = generator.call(obj);

  let result;

  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};

/**
 * It takes a regular expression and a string, and returns an array of all the matches
 *
 * @param {string} regExp - The regular expression to match against.
 * @param {string} str - The string to search.
 *
 * @returns {Array<boolean>}
 */
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];

  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }

  return arr;
};

/* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
const isHTMLForm = kindOfTest('HTMLFormElement');

const toCamelCase = (str) => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
    return p1.toUpperCase() + p2;
  });
};

/* Creating a function that will check if an object has a property. */
const hasOwnProperty = (
  ({ hasOwnProperty }) =>
  (obj, prop) =>
    hasOwnProperty.call(obj, prop)
)(Object.prototype);

/**
 * Determine if a value is a RegExp object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a RegExp object, otherwise false
 */
const isRegExp = kindOfTest('RegExp');

const reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};

  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });

  Object.defineProperties(obj, reducedDescriptors);
};

/**
 * Makes all methods read-only
 * @param {Object} obj
 */

const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    // skip restricted props in strict mode
    if (isFunction$1(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
      return false;
    }

    const value = obj[name];

    if (!isFunction$1(value)) return;

    descriptor.enumerable = false;

    if ('writable' in descriptor) {
      descriptor.writable = false;
      return;
    }

    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};

/**
 * Converts an array or a delimited string into an object set with values as keys and true as values.
 * Useful for fast membership checks.
 *
 * @param {Array|string} arrayOrString - The array or string to convert.
 * @param {string} delimiter - The delimiter to use if input is a string.
 * @returns {Object} An object with keys from the array or string, values set to true.
 */
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};

  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };

  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

  return obj;
};

const noop = () => {};

const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite((value = +value)) ? value : defaultValue;
};

/**
 * If the thing is a FormData object, return true, otherwise return false.
 *
 * @param {unknown} thing - The thing to check.
 *
 * @returns {boolean}
 */
function isSpecCompliantForm(thing) {
  return !!(
    thing &&
    isFunction$1(thing.append) &&
    thing[toStringTag] === 'FormData' &&
    thing[iterator]
  );
}

/**
 * Recursively converts an object to a JSON-compatible object, handling circular references and Buffers.
 *
 * @param {Object} obj - The object to convert.
 * @returns {Object} The JSON-compatible object.
 */
const toJSONObject = (obj) => {
  const stack = new Array(10);

  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }

      //Buffer check
      if (isBuffer(source)) {
        return source;
      }

      if (!('toJSON' in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};

        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });

        stack[i] = undefined;

        return target;
      }
    }

    return source;
  };

  return visit(obj, 0);
};

/**
 * Determines if a value is an async function.
 *
 * @param {*} thing - The value to test.
 * @returns {boolean} True if value is an async function, otherwise false.
 */
const isAsyncFn = kindOfTest('AsyncFunction');

/**
 * Determines if a value is thenable (has then and catch methods).
 *
 * @param {*} thing - The value to test.
 * @returns {boolean} True if value is thenable, otherwise false.
 */
const isThenable = (thing) =>
  thing &&
  (isObject(thing) || isFunction$1(thing)) &&
  isFunction$1(thing.then) &&
  isFunction$1(thing.catch);

// original code
// https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

/**
 * Provides a cross-platform setImmediate implementation.
 * Uses native setImmediate if available, otherwise falls back to postMessage or setTimeout.
 *
 * @param {boolean} setImmediateSupported - Whether setImmediate is supported.
 * @param {boolean} postMessageSupported - Whether postMessage is supported.
 * @returns {Function} A function to schedule a callback asynchronously.
 */
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }

  return postMessageSupported
    ? ((token, callbacks) => {
        _global.addEventListener(
          'message',
          ({ source, data }) => {
            if (source === _global && data === token) {
              callbacks.length && callbacks.shift()();
            }
          },
          false
        );

        return (cb) => {
          callbacks.push(cb);
          _global.postMessage(token, '*');
        };
      })(`axios@${Math.random()}`, [])
    : (cb) => setTimeout(cb);
})(typeof setImmediate === 'function', isFunction$1(_global.postMessage));

/**
 * Schedules a microtask or asynchronous callback as soon as possible.
 * Uses queueMicrotask if available, otherwise falls back to process.nextTick or _setImmediate.
 *
 * @type {Function}
 */
const asap =
  typeof queueMicrotask !== 'undefined'
    ? queueMicrotask.bind(_global)
    : (typeof process !== 'undefined' && process.nextTick) || _setImmediate;

// *********************

const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);

const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber: isNumber$1,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isReactNativeBlob,
  isReactNative,
  isBlob,
  isRegExp,
  isFunction: isFunction$1,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable,
};

let AxiosError$1 = class AxiosError extends Error {
  static from(error, code, config, request, response, customProps) {
    const axiosError = new AxiosError(error.message, code || error.code, config, request, response);
    axiosError.cause = error;
    axiosError.name = error.name;

    // Preserve status from the original error if not already set from response
    if (error.status != null && axiosError.status == null) {
      axiosError.status = error.status;
    }

    customProps && Object.assign(axiosError, customProps);
    return axiosError;
  }

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    constructor(message, code, config, request, response) {
      super(message);
      
      // Make message enumerable to maintain backward compatibility
      // The native Error constructor sets message as non-enumerable,
      // but axios < v1.13.3 had it as enumerable
      Object.defineProperty(this, 'message', {
          value: message,
          enumerable: true,
          writable: true,
          configurable: true
      });
      
      this.name = 'AxiosError';
      this.isAxiosError = true;
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      if (response) {
          this.response = response;
          this.status = response.status;
      }
    }

  toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status,
    };
  }
};

// This can be changed to static properties as soon as the parser options in .eslint.cjs are updated.
AxiosError$1.ERR_BAD_OPTION_VALUE = 'ERR_BAD_OPTION_VALUE';
AxiosError$1.ERR_BAD_OPTION = 'ERR_BAD_OPTION';
AxiosError$1.ECONNABORTED = 'ECONNABORTED';
AxiosError$1.ETIMEDOUT = 'ETIMEDOUT';
AxiosError$1.ERR_NETWORK = 'ERR_NETWORK';
AxiosError$1.ERR_FR_TOO_MANY_REDIRECTS = 'ERR_FR_TOO_MANY_REDIRECTS';
AxiosError$1.ERR_DEPRECATED = 'ERR_DEPRECATED';
AxiosError$1.ERR_BAD_RESPONSE = 'ERR_BAD_RESPONSE';
AxiosError$1.ERR_BAD_REQUEST = 'ERR_BAD_REQUEST';
AxiosError$1.ERR_CANCELED = 'ERR_CANCELED';
AxiosError$1.ERR_NOT_SUPPORT = 'ERR_NOT_SUPPORT';
AxiosError$1.ERR_INVALID_URL = 'ERR_INVALID_URL';

// eslint-disable-next-line strict
const httpAdapter = null;

/**
 * Determines if the given thing is a array or js object.
 *
 * @param {string} thing - The object or array to be visited.
 *
 * @returns {boolean}
 */
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}

/**
 * It removes the brackets from the end of a string
 *
 * @param {string} key - The key of the parameter.
 *
 * @returns {string} the key without the brackets.
 */
function removeBrackets(key) {
  return utils$1.endsWith(key, '[]') ? key.slice(0, -2) : key;
}

/**
 * It takes a path, a key, and a boolean, and returns a string
 *
 * @param {string} path - The path to the current key.
 * @param {string} key - The key of the current object being iterated over.
 * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
 *
 * @returns {string} The path to the current key.
 */
function renderKey(path, key, dots) {
  if (!path) return key;
  return path
    .concat(key)
    .map(function each(token, i) {
      // eslint-disable-next-line no-param-reassign
      token = removeBrackets(token);
      return !dots && i ? '[' + token + ']' : token;
    })
    .join(dots ? '.' : '');
}

/**
 * If the array is an array and none of its elements are visitable, then it's a flat array.
 *
 * @param {Array<any>} arr - The array to check
 *
 * @returns {boolean}
 */
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}

const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});

/**
 * Convert a data object to FormData
 *
 * @param {Object} obj
 * @param {?Object} [formData]
 * @param {?Object} [options]
 * @param {Function} [options.visitor]
 * @param {Boolean} [options.metaTokens = true]
 * @param {Boolean} [options.dots = false]
 * @param {?Boolean} [options.indexes = false]
 *
 * @returns {Object}
 **/

/**
 * It converts an object into a FormData object
 *
 * @param {Object<any, any>} obj - The object to convert to form data.
 * @param {string} formData - The FormData object to append to.
 * @param {Object<string, any>} options
 *
 * @returns
 */
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError('target must be an object');
  }

  // eslint-disable-next-line no-param-reassign
  formData = formData || new (FormData)();

  // eslint-disable-next-line no-param-reassign
  options = utils$1.toFlatObject(
    options,
    {
      metaTokens: true,
      dots: false,
      indexes: false,
    },
    false,
    function defined(option, source) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      return !utils$1.isUndefined(source[option]);
    }
  );

  const metaTokens = options.metaTokens;
  // eslint-disable-next-line no-use-before-define
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || (typeof Blob !== 'undefined' && Blob);
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);

  if (!utils$1.isFunction(visitor)) {
    throw new TypeError('visitor must be a function');
  }

  function convertValue(value) {
    if (value === null) return '';

    if (utils$1.isDate(value)) {
      return value.toISOString();
    }

    if (utils$1.isBoolean(value)) {
      return value.toString();
    }

    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1('Blob is not supported. Use a Buffer instead.');
    }

    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    }

    return value;
  }

  /**
   * Default visitor.
   *
   * @param {*} value
   * @param {String|Number} key
   * @param {Array<String|Number>} path
   * @this {FormData}
   *
   * @returns {boolean} return true to visit the each prop of the value recursively
   */
  function defaultVisitor(value, key, path) {
    let arr = value;

    if (utils$1.isReactNative(formData) && utils$1.isReactNativeBlob(value)) {
      formData.append(renderKey(path, key, dots), convertValue(value));
      return false;
    }

    if (value && !path && typeof value === 'object') {
      if (utils$1.endsWith(key, '{}')) {
        // eslint-disable-next-line no-param-reassign
        key = metaTokens ? key : key.slice(0, -2);
        // eslint-disable-next-line no-param-reassign
        value = JSON.stringify(value);
      } else if (
        (utils$1.isArray(value) && isFlatArray(value)) ||
        ((utils$1.isFileList(value) || utils$1.endsWith(key, '[]')) && (arr = utils$1.toArray(value)))
      ) {
        // eslint-disable-next-line no-param-reassign
        key = removeBrackets(key);

        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) &&
            formData.append(
              // eslint-disable-next-line no-nested-ternary
              indexes === true
                ? renderKey([key], index, dots)
                : indexes === null
                  ? key
                  : key + '[]',
              convertValue(el)
            );
        });
        return false;
      }
    }

    if (isVisitable(value)) {
      return true;
    }

    formData.append(renderKey(path, key, dots), convertValue(value));

    return false;
  }

  const stack = [];

  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable,
  });

  function build(value, path) {
    if (utils$1.isUndefined(value)) return;

    if (stack.indexOf(value) !== -1) {
      throw Error('Circular reference detected in ' + path.join('.'));
    }

    stack.push(value);

    utils$1.forEach(value, function each(el, key) {
      const result =
        !(utils$1.isUndefined(el) || el === null) &&
        visitor.call(formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers);

      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });

    stack.pop();
  }

  if (!utils$1.isObject(obj)) {
    throw new TypeError('data must be an object');
  }

  build(obj);

  return formData;
}

/**
 * It encodes a string by replacing all characters that are not in the unreserved set with
 * their percent-encoded equivalents
 *
 * @param {string} str - The string to encode.
 *
 * @returns {string} The encoded string.
 */
function encode$1(str) {
  const charMap = {
    '!': '%21',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '~': '%7E',
    '%20': '+',
    '%00': '\x00',
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}

/**
 * It takes a params object and converts it to a FormData object
 *
 * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
 * @param {Object<string, any>} options - The options object passed to the Axios constructor.
 *
 * @returns {void}
 */
function AxiosURLSearchParams(params, options) {
  this._pairs = [];

  params && toFormData$1(params, this, options);
}

const prototype = AxiosURLSearchParams.prototype;

prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};

prototype.toString = function toString(encoder) {
  const _encode = encoder
    ? function (value) {
        return encoder.call(this, value, encode$1);
      }
    : encode$1;

  return this._pairs
    .map(function each(pair) {
      return _encode(pair[0]) + '=' + _encode(pair[1]);
    }, '')
    .join('&');
};

/**
 * It replaces URL-encoded forms of `:`, `$`, `,`, and spaces with
 * their plain counterparts (`:`, `$`, `,`, `+`).
 *
 * @param {string} val The value to be encoded.
 *
 * @returns {string} The encoded value.
 */
function encode(val) {
  return encodeURIComponent(val)
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @param {?(object|Function)} options
 *
 * @returns {string} The formatted url
 */
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }

  const _encode = (options && options.encode) || encode;

  const _options = utils$1.isFunction(options)
    ? {
        serialize: options,
      }
    : options;

  const serializeFn = _options && _options.serialize;

  let serializedParams;

  if (serializeFn) {
    serializedParams = serializeFn(params, _options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params)
      ? params.toString()
      : new AxiosURLSearchParams(params, _options).toString(_encode);
  }

  if (serializedParams) {
    const hashmarkIndex = url.indexOf('#');

    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
}

class InterceptorManager {
  constructor() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null,
    });
    return this.handlers.length - 1;
  }

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}

const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false,
  legacyInterceptorReqResOrdering: true,
};

const URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

const FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

const Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

const platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1,
  },
  protocols: ['http', 'https', 'file', 'blob', 'url', 'data'],
};

const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

const _navigator = (typeof navigator === 'object' && navigator) || undefined;

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 *
 * @returns {boolean}
 */
const hasStandardBrowserEnv =
  hasBrowserEnv &&
  (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

/**
 * Determine if we're running in a standard browser webWorker environment
 *
 * Although the `isStandardBrowserEnv` method indicates that
 * `allows axios to run in a web worker`, the WebWorker will still be
 * filtered out due to its judgment standard
 * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
 * This leads to a problem when axios post `FormData` in webWorker
 */
const hasStandardBrowserWebWorkerEnv = (() => {
  return (
    typeof WorkerGlobalScope !== 'undefined' &&
    // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts === 'function'
  );
})();

const origin = (hasBrowserEnv && window.location.href) || 'http://localhost';

const utils = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: 'Module' }));

const platform = {
  ...utils,
  ...platform$1,
};

function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function (value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString('base64'));
        return false;
      }

      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options,
  });
}

/**
 * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
 *
 * @param {string} name - The name of the property to get.
 *
 * @returns An array of strings.
 */
function parsePropPath(name) {
  // foo[x][y][z]
  // foo.x.y.z
  // foo-x-y-z
  // foo x y z
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === '[]' ? '' : match[1] || match[0];
  });
}

/**
 * Convert an array to an object.
 *
 * @param {Array<any>} arr - The array to convert to an object.
 *
 * @returns An object with the same keys and values as the array.
 */
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}

/**
 * It takes a FormData object and returns a JavaScript object
 *
 * @param {string} formData The FormData object to convert to JSON.
 *
 * @returns {Object<string, any> | null} The converted object.
 */
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];

    if (name === '__proto__') return true;

    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;

    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }

      return !isNumericKey;
    }

    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }

    const result = buildPath(path, value, target[name], index);

    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }

    return !isNumericKey;
  }

  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};

    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });

    return obj;
  }

  return null;
}

/**
 * It takes a string, tries to parse it, and if it fails, it returns the stringified version
 * of the input
 *
 * @param {any} rawValue - The value to be stringified.
 * @param {Function} parser - A function that parses a string into a JavaScript object.
 * @param {Function} encoder - A function that takes a value and returns a string.
 *
 * @returns {string} A stringified version of the rawValue.
 */
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

const defaults = {
  transitional: transitionalDefaults,

  adapter: ['xhr', 'http', 'fetch'],

  transformRequest: [
    function transformRequest(data, headers) {
      const contentType = headers.getContentType() || '';
      const hasJSONContentType = contentType.indexOf('application/json') > -1;
      const isObjectPayload = utils$1.isObject(data);

      if (isObjectPayload && utils$1.isHTMLForm(data)) {
        data = new FormData(data);
      }

      const isFormData = utils$1.isFormData(data);

      if (isFormData) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
      }

      if (
        utils$1.isArrayBuffer(data) ||
        utils$1.isBuffer(data) ||
        utils$1.isStream(data) ||
        utils$1.isFile(data) ||
        utils$1.isBlob(data) ||
        utils$1.isReadableStream(data)
      ) {
        return data;
      }
      if (utils$1.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$1.isURLSearchParams(data)) {
        headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
        return data.toString();
      }

      let isFileList;

      if (isObjectPayload) {
        if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
          return toURLEncodedForm(data, this.formSerializer).toString();
        }

        if (
          (isFileList = utils$1.isFileList(data)) ||
          contentType.indexOf('multipart/form-data') > -1
        ) {
          const _FormData = this.env && this.env.FormData;

          return toFormData$1(
            isFileList ? { 'files[]': data } : data,
            _FormData && new _FormData(),
            this.formSerializer
          );
        }
      }

      if (isObjectPayload || hasJSONContentType) {
        headers.setContentType('application/json', false);
        return stringifySafely(data);
      }

      return data;
    },
  ],

  transformResponse: [
    function transformResponse(data) {
      const transitional = this.transitional || defaults.transitional;
      const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      const JSONRequested = this.responseType === 'json';

      if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
        return data;
      }

      if (
        data &&
        utils$1.isString(data) &&
        ((forcedJSONParsing && !this.responseType) || JSONRequested)
      ) {
        const silentJSONParsing = transitional && transitional.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;

        try {
          return JSON.parse(data, this.parseReviver);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e;
          }
        }
      }

      return data;
    },
  ],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob,
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': undefined,
    },
  },
};

utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
  defaults.headers[method] = {};
});

// RawAxiosHeaders whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
const ignoreDuplicateOf = utils$1.toObjectSet([
  'age',
  'authorization',
  'content-length',
  'content-type',
  'etag',
  'expires',
  'from',
  'host',
  'if-modified-since',
  'if-unmodified-since',
  'last-modified',
  'location',
  'max-forwards',
  'proxy-authorization',
  'referer',
  'retry-after',
  'user-agent',
]);

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} rawHeaders Headers needing to be parsed
 *
 * @returns {Object} Headers parsed into an object
 */
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;

  rawHeaders &&
    rawHeaders.split('\n').forEach(function parser(line) {
      i = line.indexOf(':');
      key = line.substring(0, i).trim().toLowerCase();
      val = line.substring(i + 1).trim();

      if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
        return;
      }

      if (key === 'set-cookie') {
        if (parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    });

  return parsed;
};

const $internals = Symbol('internals');

const isValidHeaderValue = (value) => !/[\r\n]/.test(value);

function assertValidHeaderValue(value, header) {
  if (value === false || value == null) {
    return;
  }

  if (utils$1.isArray(value)) {
    value.forEach((v) => assertValidHeaderValue(v, header));
    return;
  }

  if (!isValidHeaderValue(String(value))) {
    throw new Error(`Invalid character in header content ["${header}"]`);
  }
}

function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}

function stripTrailingCRLF(str) {
  let end = str.length;

  while (end > 0) {
    const charCode = str.charCodeAt(end - 1);

    if (charCode !== 10 && charCode !== 13) {
      break;
    }

    end -= 1;
  }

  return end === str.length ? str : str.slice(0, end);
}

function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }

  return utils$1.isArray(value) ? value.map(normalizeValue) : stripTrailingCRLF(String(value));
}

function parseTokens(str) {
  const tokens = Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;

  while ((match = tokensRE.exec(str))) {
    tokens[match[1]] = match[2];
  }

  return tokens;
}

const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
  if (utils$1.isFunction(filter)) {
    return filter.call(this, value, header);
  }

  if (isHeaderNameFilter) {
    value = header;
  }

  if (!utils$1.isString(value)) return;

  if (utils$1.isString(filter)) {
    return value.indexOf(filter) !== -1;
  }

  if (utils$1.isRegExp(filter)) {
    return filter.test(value);
  }
}

function formatHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
}

function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(' ' + header);

  ['get', 'set', 'has'].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function (arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true,
    });
  });
}

let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }

  set(header, valueOrRewrite, rewrite) {
    const self = this;

    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);

      if (!lHeader) {
        throw new Error('header name must be a non-empty string');
      }

      const key = utils$1.findKey(self, lHeader);

      if (
        !key ||
        self[key] === undefined ||
        _rewrite === true ||
        (_rewrite === undefined && self[key] !== false)
      ) {
        assertValidHeaderValue(_value, _header);
        self[key || _header] = normalizeValue(_value);
      }
    }

    const setHeaders = (headers, _rewrite) =>
      utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {},
        dest,
        key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError('Object iterator must return a key-value pair');
        }

        obj[(key = entry[0])] = (dest = obj[key])
          ? utils$1.isArray(dest)
            ? [...dest, entry[1]]
            : [dest, entry[1]]
          : entry[1];
      }

      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }

    return this;
  }

  get(header, parser) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils$1.findKey(this, header);

      if (key) {
        const value = this[key];

        if (!parser) {
          return value;
        }

        if (parser === true) {
          return parseTokens(value);
        }

        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }

        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }

        throw new TypeError('parser must be boolean|regexp|function');
      }
    }
  }

  has(header, matcher) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils$1.findKey(this, header);

      return !!(
        key &&
        this[key] !== undefined &&
        (!matcher || matchHeaderValue(this, this[key], key, matcher))
      );
    }

    return false;
  }

  delete(header, matcher) {
    const self = this;
    let deleted = false;

    function deleteHeader(_header) {
      _header = normalizeHeader(_header);

      if (_header) {
        const key = utils$1.findKey(self, _header);

        if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
          delete self[key];

          deleted = true;
        }
      }
    }

    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }

    return deleted;
  }

  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;

    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }

    return deleted;
  }

  normalize(format) {
    const self = this;
    const headers = {};

    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);

      if (key) {
        self[key] = normalizeValue(value);
        delete self[header];
        return;
      }

      const normalized = format ? formatHeader(header) : String(header).trim();

      if (normalized !== header) {
        delete self[header];
      }

      self[normalized] = normalizeValue(value);

      headers[normalized] = true;
    });

    return this;
  }

  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }

  toJSON(asStrings) {
    const obj = Object.create(null);

    utils$1.forEach(this, (value, header) => {
      value != null &&
        value !== false &&
        (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
    });

    return obj;
  }

  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }

  toString() {
    return Object.entries(this.toJSON())
      .map(([header, value]) => header + ': ' + value)
      .join('\n');
  }

  getSetCookie() {
    return this.get('set-cookie') || [];
  }

  get [Symbol.toStringTag]() {
    return 'AxiosHeaders';
  }

  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }

  static concat(first, ...targets) {
    const computed = new this(first);

    targets.forEach((target) => computed.set(target));

    return computed;
  }

  static accessor(header) {
    const internals =
      (this[$internals] =
      this[$internals] =
        {
          accessors: {},
        });

    const accessors = internals.accessors;
    const prototype = this.prototype;

    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);

      if (!accessors[lHeader]) {
        buildAccessors(prototype, _header);
        accessors[lHeader] = true;
      }
    }

    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

    return this;
  }
};

AxiosHeaders$1.accessor([
  'Content-Type',
  'Content-Length',
  'Accept',
  'Accept-Encoding',
  'User-Agent',
  'Authorization',
]);

// reserved names hotfix
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    },
  };
});

utils$1.freezeMethods(AxiosHeaders$1);

/**
 * Transform the data for a request or a response
 *
 * @param {Array|Function} fns A single function or Array of functions
 * @param {?Object} response The response object
 *
 * @returns {*} The resulting transformed data
 */
function transformData(fns, response) {
  const config = this || defaults;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;

  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });

  headers.normalize();

  return data;
}

function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}

let CanceledError$1 = class CanceledError extends AxiosError$1 {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(message, config, request) {
    super(message == null ? 'canceled' : message, AxiosError$1.ERR_CANCELED, config, request);
    this.name = 'CanceledError';
    this.__CANCEL__ = true;
  }
};

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 *
 * @returns {object} The response.
 */
function settle(resolve, reject, response) {
  const validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(
      new AxiosError$1(
        'Request failed with status code ' + response.status,
        [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][
          Math.floor(response.status / 100) - 4
        ],
        response.config,
        response.request,
        response
      )
    );
  }
}

function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return (match && match[1]) || '';
}

/**
 * Calculate data maxRate
 * @param {Number} [samplesCount= 10]
 * @param {Number} [min= 1000]
 * @returns {Function}
 */
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;

  min = min !== undefined ? min : 1000;

  return function push(chunkLength) {
    const now = Date.now();

    const startedAt = timestamps[tail];

    if (!firstSampleTS) {
      firstSampleTS = now;
    }

    bytes[head] = chunkLength;
    timestamps[head] = now;

    let i = tail;
    let bytesCount = 0;

    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }

    head = (head + 1) % samplesCount;

    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }

    if (now - firstSampleTS < min) {
      return;
    }

    const passed = startedAt && now - startedAt;

    return passed ? Math.round((bytesCount * 1000) / passed) : undefined;
  };
}

/**
 * Throttle decorator
 * @param {Function} fn
 * @param {Number} freq
 * @return {Function}
 */
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1000 / freq;
  let lastArgs;
  let timer;

  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };

  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };

  const flush = () => lastArgs && invoke(lastArgs);

  return [throttled, flush];
}

const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);

  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;

    bytesNotified = loaded;

    const data = {
      loaded,
      total,
      progress: total ? loaded / total : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? 'download' : 'upload']: true,
    };

    listener(data);
  }, freq);
};

const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;

  return [
    (loaded) =>
      throttled[0]({
        lengthComputable,
        total,
        loaded,
      }),
    throttled[1],
  ];
};

const asyncDecorator =
  (fn) =>
  (...args) =>
    utils$1.asap(() => fn(...args));

const isURLSameOrigin = platform.hasStandardBrowserEnv
  ? ((origin, isMSIE) => (url) => {
      url = new URL(url, platform.origin);

      return (
        origin.protocol === url.protocol &&
        origin.host === url.host &&
        (isMSIE || origin.port === url.port)
      );
    })(
      new URL(platform.origin),
      platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
    )
  : () => true;

const cookies = platform.hasStandardBrowserEnv
  ? // Standard browser envs support document.cookie
    {
      write(name, value, expires, path, domain, secure, sameSite) {
        if (typeof document === 'undefined') return;

        const cookie = [`${name}=${encodeURIComponent(value)}`];

        if (utils$1.isNumber(expires)) {
          cookie.push(`expires=${new Date(expires).toUTCString()}`);
        }
        if (utils$1.isString(path)) {
          cookie.push(`path=${path}`);
        }
        if (utils$1.isString(domain)) {
          cookie.push(`domain=${domain}`);
        }
        if (secure === true) {
          cookie.push('secure');
        }
        if (utils$1.isString(sameSite)) {
          cookie.push(`SameSite=${sameSite}`);
        }

        document.cookie = cookie.join('; ');
      },

      read(name) {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
      },

      remove(name) {
        this.write(name, '', Date.now() - 86400000, '/');
      },
    }
  : // Non-standard browser env (web workers, react-native) lack needed support.
    {
      write() {},
      read() {
        return null;
      },
      remove() {},
    };

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 *
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  if (typeof url !== 'string') {
    return false;
  }

  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 *
 * @returns {string} The combined URL
 */
function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 *
 * @returns {string} The combined full path
 */
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

const headersToObject = (thing) => (thing instanceof AxiosHeaders$1 ? { ...thing } : thing);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 *
 * @returns {Object} New object resulting from merging config2 to config1
 */
function mergeConfig$1(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  const config = {};

  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(undefined, a, prop, caseless);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }

  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) =>
      mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true),
  };

  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') return;
    const merge = utils$1.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
    const configValue = merge(config1[prop], config2[prop], prop);
    (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
}

const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);

  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;

  newConfig.headers = headers = AxiosHeaders$1.from(headers);

  newConfig.url = buildURL(
    buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls),
    config.params,
    config.paramsSerializer
  );

  // HTTP basic authentication
  if (auth) {
    headers.set(
      'Authorization',
      'Basic ' +
        btoa(
          (auth.username || '') +
            ':' +
            (auth.password ? unescape(encodeURIComponent(auth.password)) : '')
        )
    );
  }

  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(undefined); // browser handles it
    } else if (utils$1.isFunction(data.getHeaders)) {
      // Node.js FormData (like form-data package)
      const formHeaders = data.getHeaders();
      // Only set safe headers to avoid overwriting security headers
      const allowedHeaders = ['content-type', 'content-length'];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }

  // Add xsrf header
  // This is only done if running in a standard browser environment.
  // Specifically not if we're in a web worker, or react-native.

  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

    if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
      // Add xsrf header
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }

  return newConfig;
};

const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

const xhrAdapter = isXHRAdapterSupported &&
  function (config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      const _config = resolveConfig(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
      let { responseType, onUploadProgress, onDownloadProgress } = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;

      function done() {
        flushUpload && flushUpload(); // flush events
        flushDownload && flushDownload(); // flush events

        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

        _config.signal && _config.signal.removeEventListener('abort', onCanceled);
      }

      let request = new XMLHttpRequest();

      request.open(_config.method.toUpperCase(), _config.url, true);

      // Set the request timeout in MS
      request.timeout = _config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        const responseHeaders = AxiosHeaders$1.from(
          'getAllResponseHeaders' in request && request.getAllResponseHeaders()
        );
        const responseData =
          !responseType || responseType === 'text' || responseType === 'json'
            ? request.responseText
            : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request,
        };

        settle(
          function _resolve(value) {
            resolve(value);
            done();
          },
          function _reject(err) {
            reject(err);
            done();
          },
          response
        );

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (
            request.status === 0 &&
            !(request.responseURL && request.responseURL.indexOf('file:') === 0)
          ) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(new AxiosError$1('Request aborted', AxiosError$1.ECONNABORTED, config, request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError(event) {
        // Browsers deliver a ProgressEvent in XHR onerror
        // (message may be empty; when present, surface it)
        // See https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/error_event
        const msg = event && event.message ? event.message : 'Network Error';
        const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config, request);
        // attach the underlying event for consumers who want details
        err.event = event || null;
        reject(err);
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout
          ? 'timeout of ' + _config.timeout + 'ms exceeded'
          : 'timeout exceeded';
        const transitional = _config.transitional || transitionalDefaults;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(
          new AxiosError$1(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
            config,
            request
          )
        );

        // Clean up request
        request = null;
      };

      // Remove Content-Type if data is undefined
      requestData === undefined && requestHeaders.setContentType(null);

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }

      // Add withCredentials to request if needed
      if (!utils$1.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = _config.responseType;
      }

      // Handle progress if needed
      if (onDownloadProgress) {
        [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
        request.addEventListener('progress', downloadThrottled);
      }

      // Not all browsers support upload events
      if (onUploadProgress && request.upload) {
        [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);

        request.upload.addEventListener('progress', uploadThrottled);

        request.upload.addEventListener('loadend', flushUpload);
      }

      if (_config.cancelToken || _config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = (cancel) => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
          request.abort();
          request = null;
        };

        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted
            ? onCanceled()
            : _config.signal.addEventListener('abort', onCanceled);
        }
      }

      const protocol = parseProtocol(_config.url);

      if (protocol && platform.protocols.indexOf(protocol) === -1) {
        reject(
          new AxiosError$1(
            'Unsupported protocol ' + protocol + ':',
            AxiosError$1.ERR_BAD_REQUEST,
            config
          )
        );
        return;
      }

      // Send the request
      request.send(requestData || null);
    });
  };

const composeSignals = (signals, timeout) => {
  const { length } = (signals = signals ? signals.filter(Boolean) : []);

  if (timeout || length) {
    let controller = new AbortController();

    let aborted;

    const onabort = function (reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(
          err instanceof AxiosError$1
            ? err
            : new CanceledError$1(err instanceof Error ? err.message : err)
        );
      }
    };

    let timer =
      timeout &&
      setTimeout(() => {
        timer = null;
        onabort(new AxiosError$1(`timeout of ${timeout}ms exceeded`, AxiosError$1.ETIMEDOUT));
      }, timeout);

    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal) => {
          signal.unsubscribe
            ? signal.unsubscribe(onabort)
            : signal.removeEventListener('abort', onabort);
        });
        signals = null;
      }
    };

    signals.forEach((signal) => signal.addEventListener('abort', onabort));

    const { signal } = controller;

    signal.unsubscribe = () => utils$1.asap(unsubscribe);

    return signal;
  }
};

const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;

  if (len < chunkSize) {
    yield chunk;
    return;
  }

  let pos = 0;
  let end;

  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};

const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};

const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }

  const reader = stream.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};

const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator = readBytes(stream, chunkSize);

  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };

  return new ReadableStream(
    {
      async pull(controller) {
        try {
          const { done, value } = await iterator.next();

          if (done) {
            _onFinish();
            controller.close();
            return;
          }

          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = (bytes += len);
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator.return();
      },
    },
    {
      highWaterMark: 2,
    }
  );
};

const DEFAULT_CHUNK_SIZE = 64 * 1024;

const { isFunction } = utils$1;

const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response,
}))(utils$1.global);

const { ReadableStream: ReadableStream$1, TextEncoder } = utils$1.global;

const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};

const factory = (env) => {
  env = utils$1.merge.call(
    {
      skipUndefined: true,
    },
    globalFetchAPI,
    env
  );

  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === 'function';
  const isRequestSupported = isFunction(Request);
  const isResponseSupported = isFunction(Response);

  if (!isFetchSupported) {
    return false;
  }

  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);

  const encodeText =
    isFetchSupported &&
    (typeof TextEncoder === 'function'
      ? (
          (encoder) => (str) =>
            encoder.encode(str)
        )(new TextEncoder())
      : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));

  const supportsRequestStream =
    isRequestSupported &&
    isReadableStreamSupported &&
    test(() => {
      let duplexAccessed = false;

      const body = new ReadableStream$1();

      const hasContentType = new Request(platform.origin, {
        body,
        method: 'POST',
        get duplex() {
          duplexAccessed = true;
          return 'half';
        },
      }).headers.has('Content-Type');

      body.cancel();

      return duplexAccessed && !hasContentType;
    });

  const supportsResponseStream =
    isResponseSupported &&
    isReadableStreamSupported &&
    test(() => utils$1.isReadableStream(new Response('').body));

  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body),
  };

  isFetchSupported &&
    (() => {
      ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach((type) => {
        !resolvers[type] &&
          (resolvers[type] = (res, config) => {
            let method = res && res[type];

            if (method) {
              return method.call(res);
            }

            throw new AxiosError$1(
              `Response type '${type}' is not supported`,
              AxiosError$1.ERR_NOT_SUPPORT,
              config
            );
          });
      });
    })();

  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }

    if (utils$1.isBlob(body)) {
      return body.size;
    }

    if (utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: 'POST',
        body,
      });
      return (await _request.arrayBuffer()).byteLength;
    }

    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }

    if (utils$1.isURLSearchParams(body)) {
      body = body + '';
    }

    if (utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };

  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());

    return length == null ? getBodyLength(body) : length;
  };

  return async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = 'same-origin',
      fetchOptions,
    } = resolveConfig(config);

    let _fetch = envFetch || fetch;

    responseType = responseType ? (responseType + '').toLowerCase() : 'text';

    let composedSignal = composeSignals(
      [signal, cancelToken && cancelToken.toAbortSignal()],
      timeout
    );

    let request = null;

    const unsubscribe =
      composedSignal &&
      composedSignal.unsubscribe &&
      (() => {
        composedSignal.unsubscribe();
      });

    let requestContentLength;

    try {
      if (
        onUploadProgress &&
        supportsRequestStream &&
        method !== 'get' &&
        method !== 'head' &&
        (requestContentLength = await resolveBodyLength(headers, data)) !== 0
      ) {
        let _request = new Request(url, {
          method: 'POST',
          body: data,
          duplex: 'half',
        });

        let contentTypeHeader;

        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
          headers.setContentType(contentTypeHeader);
        }

        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );

          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }

      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? 'include' : 'omit';
      }

      // Cloudflare Workers throws when credentials are defined
      // see https://github.com/cloudflare/workerd/issues/902
      const isCredentialsSupported = isRequestSupported && 'credentials' in Request.prototype;

      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: 'half',
        credentials: isCredentialsSupported ? withCredentials : undefined,
      };

      request = isRequestSupported && new Request(url, resolvedOptions);

      let response = await (isRequestSupported
        ? _fetch(request, fetchOptions)
        : _fetch(url, resolvedOptions));

      const isStreamResponse =
        supportsResponseStream && (responseType === 'stream' || responseType === 'response');

      if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
        const options = {};

        ['status', 'statusText', 'headers'].forEach((prop) => {
          options[prop] = response[prop];
        });

        const responseContentLength = utils$1.toFiniteNumber(response.headers.get('content-length'));

        const [onProgress, flush] =
          (onDownloadProgress &&
            progressEventDecorator(
              responseContentLength,
              progressEventReducer(asyncDecorator(onDownloadProgress), true)
            )) ||
          [];

        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }

      responseType = responseType || 'text';

      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || 'text'](
        response,
        config
      );

      !isStreamResponse && unsubscribe && unsubscribe();

      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request,
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();

      if (err && err.name === 'TypeError' && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1(
            'Network Error',
            AxiosError$1.ERR_NETWORK,
            config,
            request,
            err && err.response
          ),
          {
            cause: err.cause || err,
          }
        );
      }

      throw AxiosError$1.from(err, err && err.code, config, request, err && err.response);
    }
  };
};

const seedCache = new Map();

const getFetch = (config) => {
  let env = (config && config.env) || {};
  const { fetch, Request, Response } = env;
  const seeds = [Request, Response, fetch];

  let len = seeds.length,
    i = len,
    seed,
    target,
    map = seedCache;

  while (i--) {
    seed = seeds[i];
    target = map.get(seed);

    target === undefined && map.set(seed, (target = i ? new Map() : factory(env)));

    map = target;
  }

  return target;
};

getFetch();

/**
 * Known adapters mapping.
 * Provides environment-specific adapters for Axios:
 * - `http` for Node.js
 * - `xhr` for browsers
 * - `fetch` for fetch API-based requests
 *
 * @type {Object<string, Function|Object>}
 */
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch,
  },
};

// Assign adapter names for easier debugging and identification
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, 'name', { value });
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
    Object.defineProperty(fn, 'adapterName', { value });
  }
});

/**
 * Render a rejection reason string for unknown or unsupported adapters
 *
 * @param {string} reason
 * @returns {string}
 */
const renderReason = (reason) => `- ${reason}`;

/**
 * Check if the adapter is resolved (function, null, or false)
 *
 * @param {Function|null|false} adapter
 * @returns {boolean}
 */
const isResolvedHandle = (adapter) =>
  utils$1.isFunction(adapter) || adapter === null || adapter === false;

/**
 * Get the first suitable adapter from the provided list.
 * Tries each adapter in order until a supported one is found.
 * Throws an AxiosError if no adapter is suitable.
 *
 * @param {Array<string|Function>|string|Function} adapters - Adapter(s) by name or function.
 * @param {Object} config - Axios request configuration
 * @throws {AxiosError} If no suitable adapter is available
 * @returns {Function} The resolved adapter function
 */
function getAdapter$1(adapters, config) {
  adapters = utils$1.isArray(adapters) ? adapters : [adapters];

  const { length } = adapters;
  let nameOrAdapter;
  let adapter;

  const rejectedReasons = {};

  for (let i = 0; i < length; i++) {
    nameOrAdapter = adapters[i];
    let id;

    adapter = nameOrAdapter;

    if (!isResolvedHandle(nameOrAdapter)) {
      adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

      if (adapter === undefined) {
        throw new AxiosError$1(`Unknown adapter '${id}'`);
      }
    }

    if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
      break;
    }

    rejectedReasons[id || '#' + i] = adapter;
  }

  if (!adapter) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) =>
        `adapter ${id} ` +
        (state === false ? 'is not supported by the environment' : 'is not available in the build')
    );

    let s = length
      ? reasons.length > 1
        ? 'since :\n' + reasons.map(renderReason).join('\n')
        : ' ' + renderReason(reasons[0])
      : 'as no adapter specified';

    throw new AxiosError$1(
      `There is no suitable adapter to dispatch the request ` + s,
      'ERR_NOT_SUPPORT'
    );
  }

  return adapter;
}

/**
 * Exports Axios adapters and utility to resolve an adapter
 */
const adapters = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: getAdapter$1,

  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: knownAdapters,
};

/**
 * Throws a `CanceledError` if cancellation has been requested.
 *
 * @param {Object} config The config that is to be used for the request
 *
 * @returns {void}
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 *
 * @returns {Promise} The Promise to be fulfilled
 */
function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  config.headers = AxiosHeaders$1.from(config.headers);

  // Transform request data
  config.data = transformData.call(config, config.transformRequest);

  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
    config.headers.setContentType('application/x-www-form-urlencoded', false);
  }

  const adapter = adapters.getAdapter(config.adapter || defaults.adapter, config);

  return adapter(config).then(
    function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(config, config.transformResponse, response);

      response.headers = AxiosHeaders$1.from(response.headers);

      return response;
    },
    function onAdapterRejection(reason) {
      if (!isCancel$1(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            config.transformResponse,
            reason.response
          );
          reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
        }
      }

      return Promise.reject(reason);
    }
  );
}

const VERSION$1 = "1.15.0";

const validators$1 = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
  validators$1[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

const deprecatedWarnings = {};

/**
 * Transitional option validator
 *
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 *
 * @returns {function}
 */
validators$1.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return (
      '[Axios v' +
      VERSION$1 +
      "] Transitional option '" +
      opt +
      "'" +
      desc +
      (message ? '. ' + message : '')
    );
  }

  // eslint-disable-next-line func-names
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError$1(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        AxiosError$1.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    // eslint-disable-next-line no-console
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};

/**
 * Assert object's properties type
 *
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 *
 * @returns {object}
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new AxiosError$1('options must be an object', AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1(
          'option ' + opt + ' must be ' + result,
          AxiosError$1.ERR_BAD_OPTION_VALUE
        );
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1('Unknown option ' + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}

const validator = {
  assertOptions,
  validators: validators$1,
};

const validators = validator.validators;

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 *
 * @return {Axios} A new instance of Axios
 */
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    };
  }

  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};

        Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

        // slice off the Error: ... line
        const stack = (() => {
          if (!dummy.stack) {
            return '';
          }

          const firstNewlineIndex = dummy.stack.indexOf('\n');

          return firstNewlineIndex === -1 ? '' : dummy.stack.slice(firstNewlineIndex + 1);
        })();
        try {
          if (!err.stack) {
            err.stack = stack;
            // match without the 2 top stack lines
          } else if (stack) {
            const firstNewlineIndex = stack.indexOf('\n');
            const secondNewlineIndex =
              firstNewlineIndex === -1 ? -1 : stack.indexOf('\n', firstNewlineIndex + 1);
            const stackWithoutTwoTopLines =
              secondNewlineIndex === -1 ? '' : stack.slice(secondNewlineIndex + 1);

            if (!String(err.stack).endsWith(stackWithoutTwoTopLines)) {
              err.stack += '\n' + stack;
            }
          }
        } catch (e) {
          // ignore the case where "stack" is an un-writable property
        }
      }

      throw err;
    }
  }

  _request(configOrUrl, config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = mergeConfig$1(this.defaults, config);

    const { transitional, paramsSerializer, headers } = config;

    if (transitional !== undefined) {
      validator.assertOptions(
        transitional,
        {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean),
          legacyInterceptorReqResOrdering: validators.transitional(validators.boolean),
        },
        false
      );
    }

    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer,
        };
      } else {
        validator.assertOptions(
          paramsSerializer,
          {
            encode: validators.function,
            serialize: validators.function,
          },
          true
        );
      }
    }

    // Set config.allowAbsoluteUrls
    if (config.allowAbsoluteUrls !== undefined) ; else if (this.defaults.allowAbsoluteUrls !== undefined) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }

    validator.assertOptions(
      config,
      {
        baseUrl: validators.spelling('baseURL'),
        withXsrfToken: validators.spelling('withXSRFToken'),
      },
      true
    );

    // Set config.method
    config.method = (config.method || this.defaults.method || 'get').toLowerCase();

    // Flatten headers
    let contextHeaders = headers && utils$1.merge(headers.common, headers[config.method]);

    headers &&
      utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], (method) => {
        delete headers[method];
      });

    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

    // filter out skipped interceptors
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      const transitional = config.transitional || transitionalDefaults;
      const legacyInterceptorReqResOrdering =
        transitional && transitional.legacyInterceptorReqResOrdering;

      if (legacyInterceptorReqResOrdering) {
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      } else {
        requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      }
    });

    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    let promise;
    let i = 0;
    let len;

    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;

      promise = Promise.resolve(config);

      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }

      return promise;
    }

    len = requestInterceptorChain.length;

    let newConfig = config;

    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }

    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    i = 0;
    len = responseInterceptorChain.length;

    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }

    return promise;
  }

  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};

// Provide aliases for supported request methods
utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios$1.prototype[method] = function (url, config) {
    return this.request(
      mergeConfig$1(config || {}, {
        method,
        url,
        data: (config || {}).data,
      })
    );
  };
});

utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(
        mergeConfig$1(config || {}, {
          method,
          headers: isForm
            ? {
                'Content-Type': 'multipart/form-data',
              }
            : {},
          url,
          data,
        })
      );
    };
  }

  Axios$1.prototype[method] = generateHTTPMethod();

  Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
});

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @param {Function} executor The executor function.
 *
 * @returns {CancelToken}
 */
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    let resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    const token = this;

    // eslint-disable-next-line func-names
    this.promise.then((cancel) => {
      if (!token._listeners) return;

      let i = token._listeners.length;

      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = (onfulfilled) => {
      let _resolve;
      // eslint-disable-next-line func-names
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message, config, request) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }

  /**
   * Subscribe to the cancel signal
   */

  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }

  /**
   * Unsubscribe from the cancel signal
   */

  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  toAbortSignal() {
    const controller = new AbortController();

    const abort = (err) => {
      controller.abort(err);
    };

    this.subscribe(abort);

    controller.signal.unsubscribe = () => this.unsubscribe(abort);

    return controller.signal;
  }

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel,
    };
  }
};

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  const args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 *
 * @returns {Function}
 */
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 *
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}

const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526,
};

Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 *
 * @returns {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);

  // Copy axios.prototype to instance
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });

  // Copy context to instance
  utils$1.extend(instance, context, null, { allOwnKeys: true });

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
const axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios$1;

// Expose Cancel & CancelToken
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;

// Expose AxiosError class
axios.AxiosError = AxiosError$1;

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = spread$1;

// Expose isAxiosError
axios.isAxiosError = isAxiosError$1;

// Expose mergeConfig
axios.mergeConfig = mergeConfig$1;

axios.AxiosHeaders = AxiosHeaders$1;

axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

axios.getAdapter = adapters.getAdapter;

axios.HttpStatusCode = HttpStatusCode$1;

axios.default = axios;

// This module is intended to unwrap Axios default export as named.
// Keep top-level export same with static properties
// so that it can keep same with es module or cjs
const {
  Axios,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken,
  VERSION,
  all,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig,
} = axios;

const BASE_URLS = {
  user: "http://localhost:8086",
  topic: "http://localhost:8081",
  workflow: "http://localhost:8084",
  // workflow_service_v2
  committee: "http://localhost:8082",
  thesis: "http://localhost:8083",
  evaluation: "http://localhost:8085",
  // evaluation_service_v2
  notification: "http://localhost:8087",
  report: "http://localhost:8088",
  // report_service_v2
  message: "http://localhost:8089",
  // NEW message_service
  analytic: "http://localhost:8090",
  grading: "http://localhost:8091"
  // grading_service_v2 (moved from 8086)
};
function makeClient(baseURL) {
  const client = axios.create({ baseURL });
  client.interceptors.request.use((config) => {
    const user = getStoredUser();
    if (user?.userId) {
      config.headers["X-User-Id"] = user.userId;
    }
    return config;
  });
  return client;
}
const userApi = makeClient(BASE_URLS.user);
const topicApi = makeClient(BASE_URLS.topic);
const workflowApi = makeClient(BASE_URLS.workflow);
const committeeApi = makeClient(BASE_URLS.committee);
const thesisApi = makeClient(BASE_URLS.thesis);
const evaluationApi = makeClient(BASE_URLS.evaluation);
const notificationApi = makeClient(BASE_URLS.notification);
makeClient(BASE_URLS.report);
const messageApi = makeClient(BASE_URLS.message);
makeClient(BASE_URLS.analytic);
makeClient(BASE_URLS.grading);

const notificationService = {
  getByUserId: (userId) => notificationApi.get(`/api/notifications/user/${userId}`).catch(() => ({ data: [] }))
};

const {useState: useState$c,useEffect: useEffect$c} = await importShared('react');
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1e3);
  if (diff < 60) return "Дөнгөж сая";
  if (diff < 3600) return `${Math.floor(diff / 60)} минутын өмнө`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} цагийн өмнө`;
  return `${Math.floor(diff / 86400)} өдрийн өмнө`;
}
function TopHeader({
  title,
  subtitle,
  userName,
  userRole,
  userInitials,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState$c(false);
  const [showProfile, setShowProfile] = useState$c(false);
  const [notifications, setNotifications] = useState$c([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  useEffect$c(() => {
    const user = getStoredUser();
    const userId = user?.userId;
    if (!userId) return;
    notificationService.getByUserId(userId).then((res) => setNotifications(res.data));
  }, []);
  const handleSearchChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };
  const unreadCount = notifications.filter((n) => n.status !== "READ").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "bg-surface border-b border-border px-6 flex items-center justify-between h-16 shrink-0 relative z-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-[15px] font-semibold text-ink-900 tracking-tight leading-none", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mt-1", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex flex-1 max-w-xl items-center gap-2 h-9 bg-surface-muted border border-border rounded-md px-3 mx-6 focus-within:border-accent focus-within:bg-surface transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-ink-400", strokeWidth: 1.6 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          placeholder: "Судалгааны ажил, оюутан, багш хайх...",
          value: query,
          onChange: (e) => handleSearchChange(e.target.value),
          className: "bg-transparent border-none outline-none text-sm text-ink-900 placeholder-ink-400 w-full"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            },
            className: "relative w-9 h-9 rounded-md flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-accent-softer transition-colors",
            "aria-label": "Мэдэгдэл",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4", strokeWidth: 1.6 }),
              unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-dot-negative)] rounded-full" })
            ]
          }
        ),
        showNotifications && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-11 w-80 bg-surface rounded-md border border-border-strong overflow-hidden shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-ink-900 tracking-tight flex items-center gap-2", children: [
              "Мэдэгдэл",
              unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tabular-nums text-white bg-accent rounded-sm px-1.5 py-0.5 font-medium", children: unreadCount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowNotifications(false), className: "text-ink-400 hover:text-ink-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4", strokeWidth: 1.6 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-72 overflow-y-auto", children: notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center text-ink-400 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-6 h-6 mx-auto mb-2 text-ink-300", strokeWidth: 1.4 }),
            "Мэдэгдэл байхгүй байна"
          ] }) : notifications.map((notif) => {
            const isUnread = notif.status !== "READ";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `flex items-start gap-3 px-4 py-3 hover:bg-surface-muted cursor-pointer border-b border-border last:border-b-0 ${isUnread ? "bg-accent-soft/60" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-semibold shrink-0 ${isUnread ? "border-accent text-accent" : "border-border-strong text-ink-500"}`, children: (notif.type || "N").substring(0, 1).toUpperCase() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    notif.title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-ink-900 tracking-tight truncate", children: notif.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700 leading-tight", children: notif.message }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-400 mt-1 tabular-nums", children: formatTime(notif.createdAt) })
                  ] }),
                  isUnread && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 bg-accent rounded-full shrink-0 mt-1.5" })
                ]
              },
              notif.id
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-accent hover:text-accent-hover font-medium tracking-tight", children: "Бүх мэдэгдлийг харах" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-border-strong mx-1.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            },
            className: "flex items-center gap-2 rounded-md px-2 h-9 hover:bg-accent-softer transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 border border-border-strong bg-surface rounded-full flex items-center justify-center text-[11px] font-semibold text-ink-700 shrink-0", children: userInitials }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:block text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-900 font-medium leading-none tracking-tight", children: userName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mt-0.5", children: userRole })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5 text-ink-400 hidden md:block", strokeWidth: 1.6 })
            ]
          }
        ),
        showProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-11 w-52 bg-surface rounded-md border border-border-strong overflow-hidden shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-900 font-medium tracking-tight", children: userName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mt-0.5", children: userRole })
          ] }),
          ["Тохиргоо", "Сонголтууд", "Тусламж & Дэмжлэг"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-muted transition-colors", children: item }, item)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: onLogout,
              className: "w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-muted hover:text-ink-900 transition-colors font-medium flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-3.5 h-3.5", strokeWidth: 1.6 }),
                "Гарах"
              ]
            }
          ) })
        ] })
      ] })
    ] })
  ] });
}

function FloatingMessageButton({ unreadCount = 0, onMessageClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: onMessageClick,
      className: "fixed bottom-6 right-6 w-12 h-12 bg-accent text-white rounded-full hover:bg-accent-hover transition-all hover:scale-105 z-50 group flex items-center justify-center",
      "aria-label": "Мессеж",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5", strokeWidth: 1.6 }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-2 -right-2 bg-[var(--color-dot-negative)] text-white text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full border border-white min-w-[18px] text-center leading-tight", children: unreadCount > 99 ? "99+" : unreadCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-full mr-3 bg-ink-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-tight", children: "Мессеж" })
      ]
    }
  );
}

const {useState: useState$b} = await importShared('react');
const pageTitles = {
  "/teacher": { title: "Хянах самбар", subtitle: "Тавтай морилно уу, Багш" },
  "/teacher/students": { title: "Оюутнууд", subtitle: "Харьцлаж буй оюутнуудынгоо харах, удирдах" },
  "/teacher/progress": { title: "Явцын хяналт", subtitle: "Бүх оюутны дэвшил, шат, эцсийн хугацааг хянах" },
  "/teacher/committee": { title: "Комисс", subtitle: "Комиссийн үнэлгээний даалгавраа удирдах" },
  "/teacher/evaluations": { title: "Комисс", subtitle: "Комиссийн үнэлгээний даалгавраа удирдах" },
  "/teacher/expert": { title: "Гадаад эксперт үнэлгээ", subtitle: "Томилогдсон комиссын оюутнуудад үнэлгээ өгөх" },
  "/teacher/settings": { title: "Тохиргоо", subtitle: "Профайл, тохиргоо удирдах" }
};
function TeacherLayout({ user }) {
  const [collapsed, setCollapsed] = useState$b(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = pageTitles[location.pathname] || pageTitles["/teacher"];
  const initials = user.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen bg-slate-50 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherSidebar, { collapsed, onToggle: () => setCollapsed(!collapsed) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TopHeader,
        {
          title: pageInfo.title,
          subtitle: pageInfo.subtitle,
          userName: user.displayName,
          userRole: "Багш",
          userInitials: initials,
          avatarColor: "from-green-500 to-green-700",
          onLogout: logout
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-y-auto p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FloatingMessageButton,
      {
        unreadCount: 5,
        onMessageClick: () => navigate("/teacher/messages")
      }
    )
  ] });
}

function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}

const CLASS_PART_SEPARATOR = '-';
const createClassGroupUtils = config => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = className => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
const arbitraryPropertyRegex = /^\[(.+)\]$/;
const getGroupIdForArbitraryProperty = className => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
};
/**
 * Exported for testing only
 */
const createClassMap = config => {
  const {
    theme,
    classGroups
  } = config;
  const classMap = {
    nextPart: new Map(),
    validators: []
  };
  for (const classGroupId in classGroups) {
    processClassesRecursively(classGroups[classGroupId], classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach(classDefinition => {
    if (typeof classDefinition === 'string') {
      const classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup]) => {
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
const getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(pathPart => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
const isThemeGetter = func => func.isThemeGetter;

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
const createLruCache = maxCacheSize => {
  if (maxCacheSize < 1) {
    return {
      get: () => undefined,
      set: () => {}
    };
  }
  let cacheSize = 0;
  let cache = new Map();
  let previousCache = new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = '!';
const MODIFIER_SEPARATOR = ':';
const MODIFIER_SEPARATOR_LENGTH = MODIFIER_SEPARATOR.length;
const createParseClassName = config => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  /**
   * Parse class name into parts.
   *
   * Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
   * @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
   */
  let parseClassName = className => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + MODIFIER_SEPARATOR_LENGTH;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      } else if (currentCharacter === '(') {
        parenDepth++;
      } else if (currentCharacter === ')') {
        parenDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const baseClassName = stripImportantModifier(baseClassNameWithImportantModifier);
    const hasImportantModifier = baseClassName !== baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.substring(fullPrefix.length)) : {
      isExternal: true,
      modifiers: [],
      hasImportantModifier: false,
      baseClassName: className,
      maybePostfixModifierPosition: undefined
    };
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const stripImportantModifier = baseClassName => {
  if (baseClassName.endsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(0, baseClassName.length - 1);
  }
  /**
   * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
   * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
   */
  if (baseClassName.startsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(1);
  }
  return baseClassName;
};

/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
const createSortModifiers = config => {
  const orderSensitiveModifiers = Object.fromEntries(config.orderSensitiveModifiers.map(modifier => [modifier, true]));
  const sortModifiers = modifiers => {
    if (modifiers.length <= 1) {
      return modifiers;
    }
    const sortedModifiers = [];
    let unsortedModifiers = [];
    modifiers.forEach(modifier => {
      const isPositionSensitive = modifier[0] === '[' || orderSensitiveModifiers[modifier];
      if (isPositionSensitive) {
        sortedModifiers.push(...unsortedModifiers.sort(), modifier);
        unsortedModifiers = [];
      } else {
        unsortedModifiers.push(modifier);
      }
    });
    sortedModifiers.push(...unsortedModifiers.sort());
    return sortedModifiers;
  };
  return sortModifiers;
};
const createConfigUtils = config => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = '';
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? ' ' + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(':');
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      // Tailwind class omitted due to conflict
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    // Tailwind class not in conflict
    result = originalClassName + (result.length > 0 ? ' ' + result : result);
  }
  return result;
};

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
const toValue = mix => {
  if (typeof mix === 'string') {
    return mix;
  }
  let resolvedValue;
  let string = '';
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
const fromTheme = key => {
  const themeGetter = theme => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+\/\d+$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = value => fractionRegex.test(value);
const isNumber = value => !!value && !Number.isNaN(Number(value));
const isInteger = value => !!value && Number.isInteger(Number(value));
const isPercent = value => value.endsWith('%') && isNumber(value.slice(0, -1));
const isTshirtSize = value => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = value =>
// `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
// For example, `hsl(0 0% 0%)` would be classified as a length without this check.
// I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = value => shadowRegex.test(value);
const isImage = value => imageRegex.test(value);
const isAnyNonArbitrary = value => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = value => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = value => arbitraryValueRegex.test(value);
const isArbitraryLength = value => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = value => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryPosition = value => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = value => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = value => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = value => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = value => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = value => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = value => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = value => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = value => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = value => getIsArbitraryVariable(value, isLabelShadow, true);
// Helpers
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
// Labels
const isLabelPosition = label => label === 'position' || label === 'percentage';
const isLabelImage = label => label === 'image' || label === 'url';
const isLabelSize = label => label === 'length' || label === 'size' || label === 'bg-size';
const isLabelLength = label => label === 'length';
const isLabelNumber = label => label === 'number';
const isLabelFamilyName = label => label === 'family-name';
const isLabelShadow = label => label === 'shadow';
const getDefaultConfig = () => {
  /**
   * Theme getters for theme variable namespaces
   * @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
   */
  /***/
  const themeColor = fromTheme('color');
  const themeFont = fromTheme('font');
  const themeText = fromTheme('text');
  const themeFontWeight = fromTheme('font-weight');
  const themeTracking = fromTheme('tracking');
  const themeLeading = fromTheme('leading');
  const themeBreakpoint = fromTheme('breakpoint');
  const themeContainer = fromTheme('container');
  const themeSpacing = fromTheme('spacing');
  const themeRadius = fromTheme('radius');
  const themeShadow = fromTheme('shadow');
  const themeInsetShadow = fromTheme('inset-shadow');
  const themeTextShadow = fromTheme('text-shadow');
  const themeDropShadow = fromTheme('drop-shadow');
  const themeBlur = fromTheme('blur');
  const themePerspective = fromTheme('perspective');
  const themeAspect = fromTheme('aspect');
  const themeEase = fromTheme('ease');
  const themeAnimate = fromTheme('animate');
  /**
   * Helpers to avoid repeating the same scales
   *
   * We use functions that create a new array every time they're called instead of static arrays.
   * This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
   */
  /***/
  const scaleBreak = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  const scalePosition = () => ['center', 'top', 'bottom', 'left', 'right', 'top-left',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'left-top', 'top-right',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'right-top', 'bottom-right',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'right-bottom', 'bottom-left',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'left-bottom'];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  const scaleOverscroll = () => ['auto', 'contain', 'none'];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, 'full', 'auto', ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, 'none', 'subgrid', isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ['auto', {
    span: ['full', isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, 'auto', isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ['auto', 'min', 'max', 'fr', isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch', 'baseline', 'center-safe', 'end-safe'];
  const scaleAlignSecondaryAxis = () => ['start', 'end', 'center', 'stretch', 'center-safe', 'end-safe'];
  const scaleMargin = () => ['auto', ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, 'auto', 'full', 'dvw', 'dvh', 'lvw', 'lvh', 'svw', 'svh', 'min', 'max', 'fit', ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ['no-repeat', {
    repeat: ['', 'x', 'y', 'space', 'round']
  }];
  const scaleBgSize = () => ['auto', 'cover', 'contain', isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', 'full', themeRadius, isArbitraryVariable, isArbitraryValue];
  const scaleBorderWidth = () => ['', isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ['solid', 'dashed', 'dotted', 'double'];
  const scaleBlendMode = () => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', themeBlur, isArbitraryVariable, isArbitraryValue];
  const scaleRotate = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, 'full', ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ['spin', 'ping', 'pulse', 'bounce'],
      aspect: ['video'],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      'drop-shadow': [isTshirtSize],
      ease: ['in', 'out', 'in-out'],
      font: [isAnyNonArbitrary],
      'font-weight': ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      'inset-shadow': [isTshirtSize],
      leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
      perspective: ['dramatic', 'near', 'normal', 'midrange', 'distant', 'none'],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ['px', isNumber],
      text: [isTshirtSize],
      'text-shadow': [isTshirtSize],
      tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ['sr-only', 'not-sr-only'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ['right', 'left', 'none', 'start', 'end']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none', 'start', 'end']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': scaleInset()
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': scaleInset()
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: scaleInset()
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, 'full', 'auto', themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['nowrap', 'wrap', 'wrap-reverse']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, 'first', 'last', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: [...scaleAlignPrimaryAxis(), 'normal']
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': [...scaleAlignSecondaryAxis(), 'normal']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal', ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ['', 'last']
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', ...scaleAlignSecondaryAxis(), {
          baseline: ['', 'last']
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': [...scaleAlignSecondaryAxis(), 'baseline']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x': [{
        'space-x': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y': [{
        'space-y': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y-reverse': ['space-y-reverse'],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, 'screen', ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': [themeContainer, 'screen', /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'none', ...scaleSizing()]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': [themeContainer, 'screen', 'none', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'prose', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        {
          screen: [themeBreakpoint]
        }, ...scaleSizing()]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ['screen', ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': ['screen', 'none', ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': ['screen', ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: [themeFontWeight, isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      'font-stretch': [{
        'font-stretch': ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded', isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isArbitraryVariableFamilyName, isArbitraryValue, themeFont]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': [isNumber, 'none', isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [/** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        themeLeading, ...scaleUnambiguousSpacing()]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['disc', 'decimal', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [...scaleLineStyle(), 'wavy']
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: [isNumber, 'from-font', 'auto', isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': [isNumber, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{
        text: ['wrap', 'nowrap', 'balance', 'pretty']
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ['break-word', 'anywhere', 'normal']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          linear: [{
            to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ['', isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': scaleBorderWidth()
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': scaleBorderWidth()
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': scaleBorderWidth()
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x': [{
        'divide-x': scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y': [{
        'divide-y': scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      'divide-style': [{
        divide: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: scaleColor()
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': scaleColor()
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': scaleColor()
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-s': [{
        'border-s': scaleColor()
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-e': [{
        'border-e': scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: [...scaleLineStyle(), 'none', 'hidden']
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: ['', isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      'shadow-color': [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      'inset-shadow': [{
        'inset-shadow': ['none', themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      'inset-shadow-color': [{
        'inset-shadow': scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      'ring-w': [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      'ring-color': [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-w': [{
        'ring-offset': [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-color': [{
        'ring-offset': scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      'inset-ring-w': [{
        'inset-ring': scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      'inset-ring-color': [{
        'inset-ring': scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      'text-shadow': [{
        'text-shadow': ['none', themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      'text-shadow-color': [{
        'text-shadow': scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': [...scaleBlendMode(), 'plus-darker', 'plus-lighter']
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      'mask-clip': [{
        'mask-clip': ['border', 'padding', 'content', 'fill', 'stroke', 'view']
      }, 'mask-no-clip'],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      'mask-composite': [{
        mask: ['add', 'subtract', 'intersect', 'exclude']
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      'mask-image-linear-pos': [{
        'mask-linear': [isNumber]
      }],
      'mask-image-linear-from-pos': [{
        'mask-linear-from': scaleMaskImagePosition()
      }],
      'mask-image-linear-to-pos': [{
        'mask-linear-to': scaleMaskImagePosition()
      }],
      'mask-image-linear-from-color': [{
        'mask-linear-from': scaleColor()
      }],
      'mask-image-linear-to-color': [{
        'mask-linear-to': scaleColor()
      }],
      'mask-image-t-from-pos': [{
        'mask-t-from': scaleMaskImagePosition()
      }],
      'mask-image-t-to-pos': [{
        'mask-t-to': scaleMaskImagePosition()
      }],
      'mask-image-t-from-color': [{
        'mask-t-from': scaleColor()
      }],
      'mask-image-t-to-color': [{
        'mask-t-to': scaleColor()
      }],
      'mask-image-r-from-pos': [{
        'mask-r-from': scaleMaskImagePosition()
      }],
      'mask-image-r-to-pos': [{
        'mask-r-to': scaleMaskImagePosition()
      }],
      'mask-image-r-from-color': [{
        'mask-r-from': scaleColor()
      }],
      'mask-image-r-to-color': [{
        'mask-r-to': scaleColor()
      }],
      'mask-image-b-from-pos': [{
        'mask-b-from': scaleMaskImagePosition()
      }],
      'mask-image-b-to-pos': [{
        'mask-b-to': scaleMaskImagePosition()
      }],
      'mask-image-b-from-color': [{
        'mask-b-from': scaleColor()
      }],
      'mask-image-b-to-color': [{
        'mask-b-to': scaleColor()
      }],
      'mask-image-l-from-pos': [{
        'mask-l-from': scaleMaskImagePosition()
      }],
      'mask-image-l-to-pos': [{
        'mask-l-to': scaleMaskImagePosition()
      }],
      'mask-image-l-from-color': [{
        'mask-l-from': scaleColor()
      }],
      'mask-image-l-to-color': [{
        'mask-l-to': scaleColor()
      }],
      'mask-image-x-from-pos': [{
        'mask-x-from': scaleMaskImagePosition()
      }],
      'mask-image-x-to-pos': [{
        'mask-x-to': scaleMaskImagePosition()
      }],
      'mask-image-x-from-color': [{
        'mask-x-from': scaleColor()
      }],
      'mask-image-x-to-color': [{
        'mask-x-to': scaleColor()
      }],
      'mask-image-y-from-pos': [{
        'mask-y-from': scaleMaskImagePosition()
      }],
      'mask-image-y-to-pos': [{
        'mask-y-to': scaleMaskImagePosition()
      }],
      'mask-image-y-from-color': [{
        'mask-y-from': scaleColor()
      }],
      'mask-image-y-to-color': [{
        'mask-y-to': scaleColor()
      }],
      'mask-image-radial': [{
        'mask-radial': [isArbitraryVariable, isArbitraryValue]
      }],
      'mask-image-radial-from-pos': [{
        'mask-radial-from': scaleMaskImagePosition()
      }],
      'mask-image-radial-to-pos': [{
        'mask-radial-to': scaleMaskImagePosition()
      }],
      'mask-image-radial-from-color': [{
        'mask-radial-from': scaleColor()
      }],
      'mask-image-radial-to-color': [{
        'mask-radial-to': scaleColor()
      }],
      'mask-image-radial-shape': [{
        'mask-radial': ['circle', 'ellipse']
      }],
      'mask-image-radial-size': [{
        'mask-radial': [{
          closest: ['side', 'corner'],
          farthest: ['side', 'corner']
        }]
      }],
      'mask-image-radial-pos': [{
        'mask-radial-at': scalePosition()
      }],
      'mask-image-conic-pos': [{
        'mask-conic': [isNumber]
      }],
      'mask-image-conic-from-pos': [{
        'mask-conic-from': scaleMaskImagePosition()
      }],
      'mask-image-conic-to-pos': [{
        'mask-conic-to': scaleMaskImagePosition()
      }],
      'mask-image-conic-from-color': [{
        'mask-conic-from': scaleColor()
      }],
      'mask-image-conic-to-color': [{
        'mask-conic-to': scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      'mask-mode': [{
        mask: ['alpha', 'luminance', 'match']
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      'mask-origin': [{
        'mask-origin': ['border', 'padding', 'content', 'fill', 'stroke', 'view']
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      'mask-position': [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      'mask-repeat': [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      'mask-size': [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      'mask-type': [{
        'mask-type': ['alpha', 'luminance']
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      'mask-image': [{
        mask: ['none', isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeDropShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      'drop-shadow-color': [{
        'drop-shadow': scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      'transition-behavior': [{
        transition: ['normal', 'discrete']
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, 'initial', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'initial', themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ['hidden', 'visible']
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      'perspective-origin': [{
        'perspective-origin': scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-x': [{
        'rotate-x': scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-y': [{
        'rotate-y': scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-z': [{
        'rotate-z': scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-z': [{
        'scale-z': scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-3d': ['scale-3d'],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, '', 'none', 'gpu', 'cpu']
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      'transform-style': [{
        transform: ['3d', 'flat']
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-z': [{
        'translate-z': scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-none': ['translate-none'],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ['none', 'auto']
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      'color-scheme': [{
        scheme: ['normal', 'dark', 'light', 'light-dark', 'only-dark', 'only-light']
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      'field-sizing': [{
        'field-sizing': ['fixed', 'content']
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['auto', 'none']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', '', 'y', 'x']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'manipulation']
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-x': [{
        'touch-pan': ['x', 'left', 'right']
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-y': [{
        'touch-pan': ['y', 'up', 'down']
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-pz': ['touch-pinch-zoom'],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ['none', ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ['none', ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      'forced-color-adjust': [{
        'forced-color-adjust': ['auto', 'none']
      }]
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      size: ['w', 'h'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      'line-clamp': ['display', 'overflow'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-x', 'border-w-y', 'border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-x', 'border-color-y', 'border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      translate: ['translate-x', 'translate-y', 'translate-none'],
      'translate-none': ['translate', 'translate-x', 'translate-y', 'translate-z'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb'],
      touch: ['touch-x', 'touch-y', 'touch-pz'],
      'touch-x': ['touch'],
      'touch-y': ['touch'],
      'touch-pz': ['touch']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    },
    orderSensitiveModifiers: ['*', '**', 'after', 'backdrop', 'before', 'details-content', 'file', 'first-letter', 'first-line', 'marker', 'placeholder', 'selection']
  };
};
const twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function resolveName(id, map = {}, fallback = "Тодорхойгүй") {
  if (!id) return fallback;
  const name = map[id];
  if (name) return name;
  return UUID_RE.test(id) ? fallback : id;
}
function initialsFromName(name) {
  if (!name) return "??";
  if (UUID_RE.test(name)) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.map((p) => p[0]).join("").toUpperCase();
  return letters.substring(0, 2) || "??";
}

const React$k = await importShared('react');
const Card = React$k.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn(
      "rounded-md border border-border bg-surface text-ink-800",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React$k.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col gap-1.5 px-6 pt-6 pb-4", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = React$k.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "h3",
  {
    ref,
    className: cn(
      "text-[15px] font-semibold leading-none tracking-tight text-ink-900",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React$k.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "p",
  {
    ref,
    className: cn("text-sm text-ink-500", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = React$k.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("px-6 pb-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React$k.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn(
      "flex items-center px-6 py-4 border-t border-border",
      className
    ),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// packages/react/compose-refs/src/composeRefs.tsx
const React$j = await importShared('react');

function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return React$j.useCallback(composeRefs(...refs), refs);
}

// packages/react/slot/src/slot.tsx
const React$i = await importShared('react');
var Slot = React$i.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = React$i.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);
  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        if (React$i.Children.count(newElement) > 1) return React$i.Children.only(null);
        return React$i.isValidElement(newElement) ? newElement.props.children : null;
      } else {
        return child;
      }
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React$i.isValidElement(newElement) ? React$i.cloneElement(newElement, void 0, newChildren) : null });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
});
Slot.displayName = "Slot";
var SlotClone = React$i.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (React$i.isValidElement(children)) {
    const childrenRef = getElementRef$1(children);
    const props2 = mergeProps(slotProps, children.props);
    if (children.type !== React$i.Fragment) {
      props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
    }
    return React$i.cloneElement(children, props2);
  }
  return React$i.Children.count(children) > 1 ? React$i.Children.only(null) : null;
});
SlotClone.displayName = "SlotClone";
var Slottable = ({ children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
};
function isSlottable(child) {
  return React$i.isValidElement(child) && child.type === Slottable;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef$1(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

const falsyToString = (value)=>typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config)=>(props)=>{
        var _config_compoundVariants;
        if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
        const { variants, defaultVariants } = config;
        const getVariantClassNames = Object.keys(variants).map((variant)=>{
            const variantProp = props === null || props === void 0 ? void 0 : props[variant];
            const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
            if (variantProp === null) return null;
            const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
            return variants[variant][variantKey];
        });
        const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param)=>{
            let [key, value] = param;
            if (value === undefined) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});
        const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param)=>{
            let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
            return Object.entries(compoundVariantOptions).every((param)=>{
                let [key, value] = param;
                return Array.isArray(value) ? value.includes({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                }[key]) : ({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                })[key] === value;
            }) ? [
                ...acc,
                cvClass,
                cvClassName
            ] : acc;
        }, []);
        return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
    };

const React$h = await importShared('react');
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium tracking-tight",
    "transition-[background-color,border-color,color] duration-150",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:pointer-events-none disabled:opacity-40"
  ].join(" "),
  {
    variants: {
      variant: {
        // Solid accent — the single primary action
        default: "bg-accent text-white hover:bg-accent-hover rounded-md",
        // Outline — neutral, secondary actions
        outline: "border border-border-strong bg-surface text-ink-800 hover:border-ink-900 hover:text-ink-900 rounded-md",
        // Ghost — tertiary / icon buttons
        ghost: "text-ink-700 hover:bg-accent-softer hover:text-ink-900 rounded-md",
        // Secondary — subtle filled
        secondary: "bg-accent-softer text-ink-900 hover:bg-ink-100 rounded-md",
        // Destructive — still monochrome; escalated via border weight
        destructive: "border border-ink-900 bg-surface text-ink-900 hover:bg-ink-900 hover:text-white rounded-md",
        // Link — inline text
        link: "text-ink-900 underline-offset-4 hover:underline px-0"
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React$h.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// packages/react/context/src/createContext.tsx
const React$g = await importShared('react');
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = React$g.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = React$g.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = React$g.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React$g.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React$g.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return React$g.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

// packages/react/use-callback-ref/src/useCallbackRef.tsx
const React$f = await importShared('react');

function useCallbackRef(callback) {
  const callbackRef = React$f.useRef(callback);
  React$f.useEffect(() => {
    callbackRef.current = callback;
  });
  return React$f.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}

// packages/react/use-layout-effect/src/useLayoutEffect.tsx
const React$e = await importShared('react');

var useLayoutEffect2 = Boolean(globalThis?.document) ? React$e.useLayoutEffect : () => {
};

// packages/react/primitive/src/primitive.tsx
const React$d = await importShared('react');

await importShared('react-dom');
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Node = React$d.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});

// packages/react/avatar/src/avatar.tsx
const React$c = await importShared('react');
var AVATAR_NAME = "Avatar";
var [createAvatarContext] = createContextScope(AVATAR_NAME);
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar$1 = React$c.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = React$c.useState("idle");
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }
);
Avatar$1.displayName = AVATAR_NAME;
var IMAGE_NAME = "AvatarImage";
var AvatarImage$1 = React$c.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange = () => {
    }, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src, imageProps.referrerPolicy);
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });
    useLayoutEffect2(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }
);
AvatarImage$1.displayName = IMAGE_NAME;
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback$1 = React$c.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = React$c.useState(delayMs === void 0);
    React$c.useEffect(() => {
      if (delayMs !== void 0) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);
    return canRender && context.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...fallbackProps, ref: forwardedRef }) : null;
  }
);
AvatarFallback$1.displayName = FALLBACK_NAME;
function useImageLoadingStatus(src, referrerPolicy) {
  const [loadingStatus, setLoadingStatus] = React$c.useState("idle");
  useLayoutEffect2(() => {
    if (!src) {
      setLoadingStatus("error");
      return;
    }
    let isMounted = true;
    const image = new window.Image();
    const updateStatus = (status) => () => {
      if (!isMounted) return;
      setLoadingStatus(status);
    };
    setLoadingStatus("loading");
    image.onload = updateStatus("loaded");
    image.onerror = updateStatus("error");
    image.src = src;
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    return () => {
      isMounted = false;
    };
  }, [src, referrerPolicy]);
  return loadingStatus;
}
var Root$1 = Avatar$1;
var Image = AvatarImage$1;
var Fallback = AvatarFallback$1;

const React$b = await importShared('react');
const Avatar = React$b.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root$1,
  {
    ref,
    className: cn(
      "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border",
      className
    ),
    ...props
  }
));
Avatar.displayName = Root$1.displayName;
const AvatarImage = React$b.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Image,
  {
    ref,
    className: cn("aspect-square h-full w-full object-cover", className),
    ...props
  }
));
AvatarImage.displayName = Image.displayName;
const AvatarFallback = React$b.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-surface-sunken text-ink-700 text-xs font-medium tracking-tight",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = Fallback.displayName;

const planService = {
  getPlans: (params) => topicApi.get("/api/v2/plans", { params }),
  getPlanById: (id) => topicApi.get(`/api/v2/plans/${id}`),
  getPlanWeeks: (planId) => topicApi.get(`/api/v2/plans/${planId}/weeks`),
  getPlanReviews: (planId) => topicApi.get(`/api/v2/plans/${planId}/reviews`),
  reviewPlan: (planId, body) => topicApi.post(`/api/v2/plans/${planId}/review`, {
    supervisorId: body.reviewedBy,
    decision: body.decision,
    feedback: body.comment
  })
};

const topicService = {
  createTopic: (body) => topicApi.post("/api/v2/topics", {
    ...body,
    createdByType: "TEACHER",
    visibility: body.visibility || "PUBLIC",
    status: body.status || "DRAFT"
  }),
  getTopics: (params) => topicApi.get("/api/v2/topics", { params }),
  getTopicRequests: (params) => topicApi.get("/api/v2/topic-requests", { params }),
  approveRequest: (requestId, teacherId) => topicApi.post(`/api/v2/topic-requests/${requestId}/approve`, { teacherId }),
  rejectRequest: (requestId, teacherId, rejectionReason) => topicApi.post(`/api/v2/topic-requests/${requestId}/reject`, { teacherId, rejectionReason }),
  getStudentProposals: (supervisorId) => topicApi.get("/api/v2/topics", { params: { createdByType: "STUDENT", supervisorId } }),
  submitTopicForDeptReview: (topicId, submittedBy) => topicApi.post(`/api/v2/topics/${topicId}/submit`, { submittedBy }),
  /**
   * Teacher rejects a student-proposed topic.
   *
   * Backend has no separate "teacher reject" endpoint, but dept-decision
   * accepts REJECT from any non-terminal status. Result: status = REJECTED
   * with the supplied reason — exactly what the UX needs.
   */
  rejectProposal: (topicId, teacherId, rejectionReason) => topicApi.post(`/api/v2/topics/${topicId}/dept-decision`, {
    decision: "REJECT",
    reviewedBy: teacherId,
    rejectionReason
  })
};

const thesisService = {
  getThesisByStudent: (studentId) => thesisApi.get(
    "/api/theses",
    { params: { studentId } }
  ).catch(() => ({ data: null })),
  getReports: (params) => thesisApi.get("/api/thesis-reports", { params }),
  getReportFiles: (reportId) => thesisApi.get(`/api/thesis-reports/${reportId}/files`),
  reviewReport: (reportId, reviewedBy, decision, notes) => thesisApi.patch(`/api/thesis-reports/${reportId}/review`, { reviewedBy, decision, notes }),
  downloadFile: (fileId) => thesisApi.get(`/api/thesis-reports/files/${fileId}/download`, { responseType: "blob" })
};

const workflowService = {
  // ── Workflow primitives (kept) ─────────────────────────────────────────
  createWorkflow: (body) => workflowApi.post("/api/workflows", body),
  addStage: (workflowId, body) => workflowApi.post(`/api/workflows/${workflowId}/stages`, body),
  activateStage: (workflowId, stageId) => workflowApi.patch(`/api/workflows/${workflowId}/stages/${stageId}/activate`),
  closeStage: (workflowId, stageId) => workflowApi.patch(`/api/workflows/${workflowId}/stages/${stageId}/close`),
  // ── Defense sessions ──────────────────────────────────────────────────
  getDefenseSessions: (params) => workflowApi.get("/api/defense-sessions", { params }).catch(() => ({ data: [] })),
  getDefenseSession: (id) => workflowApi.get(`/api/defense-sessions/${id}`).catch(() => ({ data: null })),
  getDefenseSessionByCommitteeStage: (committeeId, stageType) => workflowApi.get("/api/defense-sessions/by-committee-stage", {
    params: { committeeId, stageType }
  }).catch(() => ({ data: null })),
  createDefenseSession: (body) => workflowApi.post("/api/defense-sessions", body),
  updateDefenseSession: (id, body) => workflowApi.patch(`/api/defense-sessions/${id}`, body),
  openDefenseSession: (id, actorId) => workflowApi.patch(`/api/defense-sessions/${id}/open`, { actorId }),
  closeDefenseSession: (id, actorId) => workflowApi.patch(`/api/defense-sessions/${id}/close`, { actorId }),
  // ── Execution sessions ────────────────────────────────────────────────
  getExecutionSessions: (params) => workflowApi.get("/api/execution-sessions", { params }).catch(() => ({ data: [] })),
  getActiveExecutionSession: (departmentId) => workflowApi.get("/api/execution-sessions/active", {
    params: departmentId ? { departmentId } : {}
  }).catch(() => ({ data: null })),
  createExecutionSession: (body) => workflowApi.post("/api/execution-sessions", body),
  openExecutionSession: (id, actorId) => workflowApi.patch(`/api/execution-sessions/${id}/open`, { actorId }),
  closeExecutionSession: (id, actorId) => workflowApi.patch(`/api/execution-sessions/${id}/close`, { actorId })
};

function normalize(raw) {
  const firstName = raw.firstName || "";
  const lastName = raw.lastName || "";
  const full = [firstName, lastName].filter(Boolean).join(" ") || raw.email || raw.id;
  const emailPrefix = raw.email?.split("@")[0] || "";
  return {
    ...raw,
    displayName: full,
    name: full,
    department: raw.departmentId,
    username: emailPrefix || raw.username || raw.id,
    studentId: emailPrefix || raw.studentId || "",
    programId: raw.programId || raw.major || ""
  };
}
const userService = {
  getStudents: (departmentId) => userApi.get("/api/users/students", { params: departmentId ? { departmentId } : {} }).then((res) => ({ ...res, data: res.data.map(normalize) })),
  getTeachers: (departmentId) => userApi.get("/api/users/teachers", { params: departmentId ? { departmentId } : {} }).then((res) => ({ ...res, data: res.data.map(normalize) })),
  getExternalExperts: () => userApi.get("/api/users/external-experts").then((res) => ({ ...res, data: res.data.map(normalize) })),
  getDepartments: () => userApi.get("/api/users/departments")
};

const {useState: useState$a,useEffect: useEffect$b} = await importShared('react');
const toneDot$6 = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]"};
const STAGE_DEFS = [
  { key: "PROGRESS_1", title: "Явц 1" },
  { key: "PROGRESS_2", title: "Явц 2" },
  { key: "PRE_DEFENSE", title: "Урьдчилсан" },
  { key: "FINAL_DEFENSE", title: "Эцсийн хамгаалалт" }
];
const stageLabel$2 = (stageType) => {
  const map = {
    PROGRESS_1: "Явц 1-ийн хяналт",
    PROGRESS_2: "Явц 2-ын хяналт",
    PRE_DEFENSE: "Урьдчилсан хамгаалалт",
    FINAL_DEFENSE: "Эцсийн хамгаалалт"
  };
  return map[stageType] || stageType;
};
function TermTimeline({ activeIndex }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[18px] left-[10%] w-[80%] h-px bg-border-strong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute top-[18px] left-[10%] h-px bg-accent transition-all duration-700",
        style: { width: `${Math.min(activeIndex / (STAGE_DEFS.length - 1) * 80, 80)}%` }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between relative", children: STAGE_DEFS.map((stage, idx) => {
      const done = idx < activeIndex;
      const active = idx === activeIndex;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center w-1/4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `w-9 h-9 rounded-full flex items-center justify-center transition-colors ${done ? "bg-accent text-white border border-accent" : active ? "bg-surface text-accent border border-accent" : "bg-surface text-ink-400 border border-border-strong"}`,
            children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4", strokeWidth: 1.8 }) : active ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 bg-accent rounded-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold tabular-nums", children: idx + 1 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-3 text-[11px] text-center tracking-tight ${active ? "text-accent font-semibold" : "text-ink-600"}`, children: stage.title })
      ] }, stage.key);
    }) })
  ] });
}
function TeacherDashboard() {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState$a(0);
  const [pendingReports, setPendingReports] = useState$a([]);
  const [reviewedCount, setReviewedCount] = useState$a(0);
  const [upcomingSessions, setUpcomingSessions] = useState$a([]);
  const [allSessions, setAllSessions] = useState$a([]);
  const [studentMap, setStudentMap] = useState$a({});
  const [loading, setLoading] = useState$a(true);
  useEffect$b(() => {
    const user = getStoredUser();
    const teacherId = user?.userId || user?.username || "";
    if (user?.systemRole === "EXTERNAL_EXPERT") {
      navigate("/teacher/expert", { replace: true });
      return;
    }
    const load = async () => {
      try {
        const [plansRes, reportsRes, sessionsRes, reqRes, usersRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          thesisService.getReports({}),
          workflowService.getDefenseSessions({ status: "OPEN" }).catch(() => ({ data: [] })),
          topicService.getTopicRequests({ status: "APPROVED" }).catch(() => ({ data: [] })),
          userService.getStudents().catch(() => ({ data: [] }))
        ]);
        const map = {};
        (usersRes.data || []).forEach((u) => {
          if (u.id) map[u.id] = u.displayName || u.name || u.id;
          if (u.username) map[u.username] = u.displayName || u.name || u.username;
        });
        setStudentMap(map);
        const uniqueStudents = new Set(plansRes.data.map((p) => p.studentId));
        const approvedReqs = (reqRes.data || []).filter(
          (r) => r.respondedById === teacherId
        );
        approvedReqs.forEach((r) => uniqueStudents.add(r.requestedById));
        setStudentCount(uniqueStudents.size);
        const myStudentIds = new Set(uniqueStudents);
        const myReports = reportsRes.data.filter((r) => myStudentIds.has(r.studentId));
        setPendingReports(myReports.filter((r) => r.status === "SUBMITTED"));
        setReviewedCount(myReports.filter((r) => r.status === "REVIEWED" || r.status === "APPROVED").length);
        setUpcomingSessions(sessionsRes.data.slice(0, 3));
        setAllSessions(sessionsRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const reviewedRatio = reviewedCount + pendingReports.length > 0 ? Math.round(reviewedCount / (reviewedCount + pendingReports.length) * 100) : 0;
  const stageOrder = ["PROGRESS_1", "PROGRESS_2", "PRE_DEFENSE", "FINAL_DEFENSE"];
  const knownStages = new Set(allSessions.map((s) => s.stageType).filter(Boolean));
  const activeIndex = (() => {
    let idx = 0;
    for (let i = 0; i < stageOrder.length; i++) {
      if (knownStages.has(stageOrder[i])) idx = i;
    }
    return idx;
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-7xl mx-auto pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate("/teacher/students"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4", strokeWidth: 1.6 }),
        " Оюутнууд"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => navigate("/teacher/students"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4", strokeWidth: 1.6 }),
        " Хүлээгдэж буй тайлан"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => navigate("/teacher/messages"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4", strokeWidth: 1.6 }),
        " Мессеж"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => navigate("/teacher/committee"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4", strokeWidth: 1.6 }),
        " Хуваарь шалгах"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-accent transition-all duration-700", style: { width: `${reviewedRatio}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${pendingReports.length > 0 ? toneDot$6.warning : toneDot$6.positive}` }),
                  pendingReports.length > 0 ? `${pendingReports.length} тайлан хянах` : "Тайлан бүгд хянагдсан"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3", strokeWidth: 1.6 }),
                  stageLabel$2(STAGE_DEFS[activeIndex]?.key || "PROGRESS_1")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-ink-900 tracking-tight leading-tight", children: "Энэ улирлын удирдсан оюутнуудын явц" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1", children: "Оюутны тайлан, үнэлгээ, хуваарийн товч мэдээллийг доороос харна уу." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 border border-border rounded-md p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-semibold text-ink-900 tabular-nums tracking-tight", children: [
                reviewedRatio,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1", children: "Хянагдсан" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            "Улирлын хуваарь"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TermTimeline, { activeIndex }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            "Тойм мэдээлэл"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
            { label: "Удирдаж буй оюутан", value: studentCount },
            { label: "Хүлээгдэж буй тайлан", value: pendingReports.length },
            { label: "Удахгүй болох үнэлгээ", value: upcomingSessions.length },
            { label: "Дууссан хяналт", value: reviewedCount }
          ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md p-3 bg-surface-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1", children: item.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-ink-900 tracking-tight tabular-nums", children: loading ? "—" : item.value })
          ] }, item.label)) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            "Хянах шаардлагатай тайлан"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-ink-400 text-sm", children: "Ачааллаж байна..." }) : pendingReports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-ink-400 text-sm", children: "Хянах тайлан байхгүй байна." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: pendingReports.map((report) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 hover:bg-surface-muted transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: initialsFromName(resolveName(report.studentId, studentMap, "Оюутан")) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tracking-tight", children: resolveName(report.studentId, studentMap, "Тодорхойгүй оюутан") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-500 mt-0.5 tabular-nums", children: [
                  report.reportType,
                  " • ",
                  report.submittedAt?.split("T")[0] || "Огноогүй"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate("/teacher/students"), children: [
              "Одоо хянах",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 ml-1.5", strokeWidth: 1.6 })
            ] })
          ] }, report.id)) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            "Удахгүй болох үнэлгээ"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-400 text-center py-4", children: "Ачааллаж байна..." }) : upcomingSessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-400 text-center py-4", children: "Удахгүй болох үнэлгээ байхгүй." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: upcomingSessions.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-md border border-border bg-surface hover:border-accent transition-colors group cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3", strokeWidth: 1.6 }),
                  session.startedAt?.split("T")[0] || "—"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-accent", strokeWidth: 1.6 })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-ink-900 tracking-tight leading-snug", children: stageLabel$2(session.stageType) })
            ] }, session.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full mt-3", onClick: () => navigate("/teacher/committee"), children: "Бүх хуваарийг харах" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            "Хурдан харагдац"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 space-y-2", children: [
            { label: "Удирдаж буй", value: studentCount },
            { label: "Хүлээгдэж буй", value: pendingReports.length },
            { label: "Хянагдсан", value: reviewedCount }
          ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1.5 border-b border-border last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-500", children: item.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-ink-900 tracking-tight tabular-nums", children: loading ? "—" : item.value })
          ] }, item.label)) })
        ] })
      ] })
    ] })
  ] });
}

// packages/core/primitive/src/primitive.tsx
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

// packages/react/collection/src/collection.tsx
const React$a = await importShared('react');
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React$a.useRef(null);
    const itemMap = React$a.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlot = React$a.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Slot, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlot = React$a.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React$a.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React$a.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Slot, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React$a.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
    createCollectionScope
  ];
}

// packages/react/id/src/id.tsx
const React$9 = await importShared('react');
var useReactId = React$9["useId".toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
  const [id, setId] = React$9.useState(useReactId());
  useLayoutEffect2(() => {
    setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return (id ? `radix-${id}` : "");
}

// packages/react/use-controllable-state/src/useControllableState.tsx
const React$8 = await importShared('react');
function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  }
}) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({ defaultProp, onChange });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = useCallbackRef(onChange);
  const setValue = React$8.useCallback(
    (nextValue) => {
      if (isControlled) {
        const setter = nextValue;
        const value2 = typeof nextValue === "function" ? setter(prop) : nextValue;
        if (value2 !== prop) handleChange(value2);
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, handleChange]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const uncontrolledState = React$8.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = React$8.useRef(value);
  const handleChange = useCallbackRef(onChange);
  React$8.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef, handleChange]);
  return uncontrolledState;
}

// packages/react/direction/src/Direction.tsx
const React$7 = await importShared('react');
var DirectionContext = React$7.createContext(void 0);
function useDirection(localDir) {
  const globalDir = React$7.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}

// packages/react/roving-focus/src/roving-focus-group.tsx
const React$6 = await importShared('react');
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = React$6.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = React$6.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = React$6.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId = null, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId,
    onChange: onCurrentTabStopIdChange
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = React$6.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = React$6.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = React$6.useState(0);
  React$6.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: React$6.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: React$6.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: React$6.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: React$6.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME = "RovingFocusGroupItem";
var RovingFocusGroupItem = React$6.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove } = context;
    React$6.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst(candidateNodes));
              }
            })
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root = RovingFocusGroup;
var Item = RovingFocusGroupItem;

// packages/react/presence/src/Presence.tsx
const React2 = await importShared('react');

// packages/react/presence/src/useStateMachine.tsx
const React$5 = await importShared('react');

function useStateMachine(initialState, machine) {
  return React$5.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}

// packages/react/presence/src/Presence.tsx
var Presence = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : React2.Children.only(children);
  const ref = useComposedRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? React2.cloneElement(child, { ref }) : null;
};
Presence.displayName = "Presence";
function usePresence(present) {
  const [node, setNode] = React2.useState();
  const stylesRef = React2.useRef({});
  const prevPresentRef = React2.useRef(present);
  const prevAnimationNameRef = React2.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  React2.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [state]);
  useLayoutEffect2(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);
      if (present) {
        send("MOUNT");
      } else if (currentAnimationName === "none" || styles?.display === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  useLayoutEffect2(() => {
    if (node) {
      let timeoutId;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      const handleAnimationEnd = (event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(event.animationName);
        if (event.target === node && isCurrentAnimation) {
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      };
      const handleAnimationStart = (event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: React2.useCallback((node2) => {
      if (node2) stylesRef.current = getComputedStyle(node2);
      setNode(node2);
    }, [])
  };
}
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

// packages/react/tabs/src/tabs.tsx
const React$4 = await importShared('react');
var TABS_NAME = "Tabs";
var [createTabsContext] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = React$4.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = React$4.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger$1 = React$4.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent$1 = React$4.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = React$4.useRef(isSelected);
    React$4.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs$1;
var List = TabsList$1;
var Trigger = TabsTrigger$1;
var Content = TabsContent$1;

const React$3 = await importShared('react');
const Tabs = Root2;
const TabsList = React$3.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-10 w-full items-center justify-start gap-6",
      "border-b border-border",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = React$3.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "relative inline-flex items-center justify-center whitespace-nowrap",
      "px-0 pt-2 pb-3 text-sm font-medium tracking-tight",
      "text-ink-500 hover:text-ink-800",
      "transition-colors duration-150",
      "focus-visible:outline-none",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:text-ink-900",
      "after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[2px] after:bg-transparent",
      "data-[state=active]:after:bg-accent",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = React$3.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-6 focus-visible:outline-none",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;

const committeeService = {
  getMyAssignments: (teacherId) => committeeApi.get("/api/committee-teachers", { params: { teacherId } }),
  getById: (id) => committeeApi.get(`/api/committees/${id}`),
  closeCommittee: (id) => committeeApi.patch(`/api/committees/${id}/close`),
  getAll: () => committeeApi.get("/api/committees"),
  getStudents: (committeeId) => committeeApi.get(`/api/committees/${committeeId}/students`),
  getMembers: (committeeId) => committeeApi.get("/api/committee-teachers", { params: { committeeId } }),
  getReviewerAssignments: (params) => committeeApi.get("/api/reviewer-assignments", { params }),
  assignReviewer: (body) => committeeApi.post("/api/reviewer-assignments", body),
  deleteReviewerAssignment: (id) => committeeApi.delete(`/api/reviewer-assignments/${id}`)
};

const evaluationService = {
  // ── Defense grades ────────────────────────────────────────────────────
  getDefenseGrades: (params) => evaluationApi.get("/api/defense-grades", { params }).catch(() => ({ data: [] })),
  getMyGrade: (params) => evaluationApi.get("/api/defense-grades/my", { params }).catch(() => ({ data: null })),
  saveGrade: (body) => evaluationApi.post("/api/defense-grades", body),
  submitGrade: (id) => evaluationApi.post(`/api/defense-grades/${id}/submit`),
  // Student-facing alias
  getMyDefenseGrades: (studentId) => evaluationApi.get("/api/defense-grades", { params: { studentId } }).catch(() => ({ data: [] })),
  // ── Secretary submissions ─────────────────────────────────────────────
  getSecretarySubmissions: (arg) => {
    const params = typeof arg === "string" ? { studentId: arg } : arg;
    return evaluationApi.get("/api/secretary-submissions", { params }).catch(() => ({ data: [] }));
  },
  getSessionSubmissions: (defenseSessionId) => evaluationApi.get("/api/secretary-submissions", {
    params: { defenseSessionId }
  }).catch(() => ({ data: [] })),
  getSecretarySubmissionByStudent: (defenseSessionId, studentId) => evaluationApi.get("/api/secretary-submissions/by-session-student", {
    params: { defenseSessionId, studentId }
  }).catch(() => ({ data: null })),
  sendAverageScore: (body) => evaluationApi.post("/api/secretary-submissions", body),
  // ── Review documents ──────────────────────────────────────────────────
  getReviewDocuments: (params) => evaluationApi.get("/api/review-documents", { params }).catch(() => ({ data: [] })),
  getMyReviewDocuments: (studentId) => evaluationApi.get("/api/review-documents", { params: { studentId } }).catch(() => ({ data: [] })),
  uploadReviewDocument: (formData) => evaluationApi.post("/api/review-documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  reviewDocumentDownloadUrl: (id) => `${evaluationApi.defaults.baseURL ?? ""}/api/review-documents/${id}/download`,
  // ── Final grades ──────────────────────────────────────────────────────
  getFinalGrades: (params) => evaluationApi.get("/api/final-grades", { params }).catch(() => ({ data: [] })),
  getMyFinalGrade: (studentId) => evaluationApi.get(`/api/final-grades/by-student/${studentId}`).then((r) => ({ data: r.data })).catch(() => ({ data: null })),
  confirmFinalGrade: (body) => evaluationApi.post("/api/final-grades", body),
  publishGrade: (id) => evaluationApi.patch(`/api/final-grades/${id}/publish`)
};

const VIEW_BASE = "http://localhost:8083/api/thesis-reports/files";
function canPreview(filename, mimeType) {
  const mt = mimeType?.toLowerCase() ?? "";
  const fn = filename?.toLowerCase() ?? "";
  return mt.includes("pdf") || mt.includes("image/") || fn.endsWith(".pdf") || fn.endsWith(".png") || fn.endsWith(".jpg") || fn.endsWith(".jpeg") || fn.endsWith(".gif");
}
function FilePreviewModal({ files, activeId, onClose, onSelect }) {
  const active = files.find((f) => f.id === activeId) ?? files[0];
  if (!active) return null;
  const previewable = canPreview(active.originalFilename, active.mimeType);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { backgroundColor: "rgba(10,10,10,0.55)" },
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-surface rounded-md border border-border-strong flex flex-col overflow-hidden",
          style: { width: "min(900px, 95vw)", height: "min(85vh, 900px)" },
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b border-border bg-surface-muted shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-ink-700 shrink-0", strokeWidth: 1.6 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-ink-900 tracking-tight truncate", children: active.originalFilename })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0 ml-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "a",
                  {
                    href: `${VIEW_BASE}/${active.id}/download`,
                    className: "flex items-center gap-1.5 text-xs text-ink-700 border border-border-strong rounded-md px-2.5 h-8 hover:border-ink-900 hover:text-ink-900 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5", strokeWidth: 1.6 }),
                      " Татаж авах"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 text-ink-400 hover:text-ink-900 hover:bg-accent-softer rounded-md transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4", strokeWidth: 1.6 }) })
              ] })
            ] }),
            files.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 px-4 py-2 border-b border-border overflow-x-auto shrink-0 bg-surface", children: files.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => onSelect(f.id),
                className: `flex items-center gap-1.5 text-xs px-2.5 h-7 rounded-md whitespace-nowrap transition-colors border ${f.id === activeId ? "bg-ink-900 text-white border-ink-900" : "bg-surface text-ink-600 border-border-strong hover:border-ink-900 hover:text-ink-900"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3", strokeWidth: 1.6 }),
                  f.originalFilename.length > 28 ? f.originalFilename.slice(0, 25) + "…" : f.originalFilename
                ]
              },
              f.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-surface-sunken overflow-hidden", children: previewable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "iframe",
              {
                src: `${VIEW_BASE}/${active.id}/view`,
                className: "w-full h-full border-0",
                title: active.originalFilename
              },
              active.id
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-3 text-ink-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 text-ink-300", strokeWidth: 1.3 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tracking-tight", children: "Файлыг шууд харах боломжгүй" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500", children: "Word болон бусад файлыг татаж авч үзнэ үү." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `${VIEW_BASE}/${active.id}/download`,
                  className: "flex items-center gap-2 bg-accent text-white text-sm px-4 h-9 rounded-md hover:bg-accent-hover transition-colors font-medium tracking-tight",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-4 h-4", strokeWidth: 1.6 }),
                    " Татаж авах"
                  ]
                }
              )
            ] }) })
          ]
        }
      )
    }
  );
}

const {useState: useState$9,useEffect: useEffect$a,useRef: useRef$1} = await importShared('react');
const toneDot$5 = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
  info: "bg-[var(--color-dot-info)]"
};
const GRADING_SCHEMES$1 = {
  PROGRESS_1: {
    label: "Явц 1-ийн үнэлгээ",
    total: 15,
    criteria: [
      { name: "Судалгааны тайлан", max: 10 },
      { name: "Танилцуулга", max: 5 }
    ]
  },
  PROGRESS_2: {
    label: "Явц 2-ын үнэлгээ",
    total: 20,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 }
    ]
  },
  PRE_DEFENSE: {
    label: "Урьдчилсан хамгаалалтын үнэлгээ",
    total: 25,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 }
    ]
  },
  FINAL_DEFENSE: {
    label: "Эцсийн хамгаалалтын үнэлгээ",
    total: 40,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 },
      { name: "Шүүмж (Reviewer)", max: 5 },
      { name: "Нэмэлт үнэлгээ", max: 10 }
    ]
  }
};
const stageFromStatus = (status) => {
  const map = {
    APPROVED: "Сэдэв батлагдсан",
    ACTIVE: "Судалгаа явагдаж байна",
    SUBMITTED: "Тайлан илгээсэн",
    PENDING_TEACHER_APPROVAL: "Багшийн батлалт хүлээж байна",
    DEPT_PENDING: "Тэнхимийн батлалт хүлээж байна",
    DRAFT: "Ноорог"
  };
  return map[status] || status;
};
const progressFromStatus$1 = (status) => {
  const map = {
    DRAFT: 10,
    PENDING_TEACHER_APPROVAL: 20,
    DEPT_PENDING: 30,
    APPROVED: 40,
    ACTIVE: 60,
    SUBMITTED: 80
  };
  return map[status] ?? 30;
};
function TeacherStudents() {
  const [searchParams] = useSearchParams();
  const committeeId = searchParams.get("committeeId");
  const stageType = searchParams.get("stageType") || "";
  const navigate = useNavigate();
  const search = searchParams.get("q") ?? "";
  const [activeTab, setActiveTab] = useState$9(committeeId ? "evaluations" : "roster");
  const [assignedStudents, setAssignedStudents] = useState$9([]);
  const [committeeStudents, setCommitteeStudents] = useState$9([]);
  const [submittedReports, setSubmittedReports] = useState$9([]);
  const [studentNameMap, setStudentNameMap] = useState$9({});
  const [loading, setLoading] = useState$9(true);
  const [reviewReportId, setReviewReportId] = useState$9(null);
  const [commentInput, setCommentInput] = useState$9("");
  const [reviewStatus, setReviewStatus] = useState$9("idle");
  const [reviewFiles, setReviewFiles] = useState$9([]);
  const [activeFileId, setActiveFileId] = useState$9(null);
  const [evalStudentId, setEvalStudentId] = useState$9(null);
  const [scores, setScores] = useState$9({});
  const [evalStatus, setEvalStatus] = useState$9("idle");
  const [evalError, setEvalError] = useState$9(null);
  const [defenseSessionId, setDefenseSessionId] = useState$9(null);
  const [teacherRole, setTeacherRole] = useState$9("MEMBER");
  const [progress1Session, setProgress1Session] = useState$9(null);
  const [scheduleForm, setScheduleForm] = useState$9({ scheduledDate: "", location: "", notes: "" });
  const [scheduleStatus, setScheduleStatus] = useState$9("idle");
  const [p1GradeStudentId, setP1GradeStudentId] = useState$9(null);
  const [p1Scores, setP1Scores] = useState$9({});
  const [p1GradeStatus, setP1GradeStatus] = useState$9("idle");
  const [p1GradeError, setP1GradeError] = useState$9(null);
  const [p1ExistingGrades, setP1ExistingGrades] = useState$9({});
  const P1_CRITERIA = [{ name: "Судалгааны тайлан", max: 10 }, { name: "Танилцуулга", max: 5 }];
  const [secretarySubmitting, setSecretarySubmitting] = useState$9(false);
  const [secretaryDone, setSecretaryDone] = useState$9(false);
  const [secretaryError, setSecretaryError] = useState$9(null);
  const [committeeMembers, setCommitteeMembers] = useState$9([]);
  const [reviewerAssignments, setReviewerAssignments] = useState$9([]);
  const [assigningReviewer, setAssigningReviewer] = useState$9({});
  const [teacherNameMap, setTeacherNameMap] = useState$9({});
  const [reviewUploadStudentId, setReviewUploadStudentId] = useState$9(null);
  const [reviewFile, setReviewFile] = useState$9(null);
  const [reviewUploadStatus, setReviewUploadStatus] = useState$9("idle");
  const [uploadedReviews, setUploadedReviews] = useState$9([]);
  const fileInputRef = useRef$1(null);
  const [allSessions, setAllSessions] = useState$9([]);
  const [studentSubmissions, setStudentSubmissions] = useState$9({});
  const [studentGrades, setStudentGrades] = useState$9({});
  const [confirmState, setConfirmState] = useState$9({});
  const [viewReportsStudent, setViewReportsStudent] = useState$9(null);
  const [viewReportsFiles, setViewReportsFiles] = useState$9([]);
  const [viewReportsActiveId, setViewReportsActiveId] = useState$9(null);
  const [viewReportsLoading, setViewReportsLoading] = useState$9(false);
  const [viewReportsError, setViewReportsError] = useState$9(null);
  const [committeeGrades, setCommitteeGrades] = useState$9({});
  const [sessionGrades, setSessionGrades] = useState$9([]);
  const [sessionSubmissions, setSessionSubmissions] = useState$9([]);
  const [sendAvgStatus, setSendAvgStatus] = useState$9({});
  const [sendAvgError, setSendAvgError] = useState$9({});
  const openStudentReports = async (student) => {
    setViewReportsStudent(student);
    setViewReportsLoading(true);
    setViewReportsError(null);
    setViewReportsFiles([]);
    setViewReportsActiveId(null);
    try {
      const reportsRes = await thesisService.getReports({ studentId: student.studentId });
      const reports = reportsRes.data || [];
      if (reports.length === 0) {
        setViewReportsError("Энэ оюутан тайлан илгээгээгүй байна.");
        return;
      }
      const filesLists = await Promise.all(
        reports.map((r) => thesisService.getReportFiles(r.id).then((r2) => r2.data).catch(() => []))
      );
      const allFiles = filesLists.flat();
      if (allFiles.length === 0) {
        setViewReportsError("Тайланд файл хавсаргагдаагүй байна.");
        return;
      }
      setViewReportsFiles(allFiles);
      setViewReportsActiveId(allFiles[0].id);
    } catch {
      setViewReportsError("Тайланг ачаалж чадсангүй.");
    } finally {
      setViewReportsLoading(false);
    }
  };
  const closeStudentReports = () => {
    setViewReportsStudent(null);
    setViewReportsFiles([]);
    setViewReportsActiveId(null);
    setViewReportsError(null);
  };
  const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
  const gradingScheme = stageType ? GRADING_SCHEMES$1[stageType] || null : null;
  const getEffectiveScheme = (studentId) => {
    if (!gradingScheme) return null;
    if (stageType !== "FINAL_DEFENSE" || !studentId) return gradingScheme;
    const isReviewer = reviewerAssignments.some(
      (a) => a.studentId === studentId && a.reviewerId === teacherId
    );
    if (isReviewer) return gradingScheme;
    const criteria = gradingScheme.criteria.filter((c) => !c.name.startsWith("Шүүмж"));
    const total = criteria.reduce((sum, c) => sum + c.max, 0);
    return { ...gradingScheme, criteria, total };
  };
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  useEffect$a(() => {
    const load = async () => {
      try {
        const [plansRes, usersRes, reportsRes, reqRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          userService.getStudents(),
          thesisService.getReports({}),
          topicService.getTopicRequests({ status: "APPROVED" }).catch(() => ({ data: [] }))
        ]);
        const plans = plansRes.data;
        const users = usersRes.data;
        const userMap = {};
        users.forEach((u) => {
          if (u.username) userMap[u.username] = u.displayName;
          userMap[u.id] = u.displayName;
        });
        setStudentNameMap(userMap);
        const planStudentIds = new Set(plans.map((p) => p.studentId));
        const approvedRequests = (reqRes.data || []).filter(
          (r) => r.status === "APPROVED" && r.respondedById === teacherId && !planStudentIds.has(r.requestedById)
        );
        const fromRequests = approvedRequests.map((r) => ({
          id: r.requestedById,
          name: resolveName(r.requestedById, userMap, "Тодорхойгүй оюутан"),
          thesis: "Гарчиггүй",
          stage: "Сэдэв батлагдсан",
          status: "APPROVED",
          progress: 5,
          studentId: r.requestedById
        }));
        const students = [
          ...plans.map((p) => ({
            id: p.studentId,
            name: resolveName(p.studentId, userMap, "Тодорхойгүй оюутан"),
            thesis: p.title || "Гарчиггүй",
            stage: stageFromStatus(p.status),
            status: p.status,
            progress: progressFromStatus$1(p.status),
            studentId: p.studentId
          })),
          ...fromRequests
        ];
        setAssignedStudents(students);
        const myStudentIds = new Set(students.map((s) => s.studentId));
        setSubmittedReports(reportsRes.data.filter((r) => r.status === "SUBMITTED" && myStudentIds.has(r.studentId)));
        workflowService.getDefenseSessions({ supervisorId: teacherId }).then((r) => {
          const s = r.data.find((x) => x.stageType === "PROGRESS_1");
          if (s) {
            setProgress1Session(s);
            setScheduleForm({
              scheduledDate: s.scheduledDate ? s.scheduledDate.slice(0, 16) : "",
              location: s.location || "",
              notes: s.notes || ""
            });
            evaluationService.getDefenseGrades({ defenseSessionId: s.id }).then((gr) => {
              const map = {};
              gr.data.forEach((g) => {
                map[g.studentId] = Number(g.points);
              });
              setP1ExistingGrades(map);
            }).catch(() => {
            });
          }
        }).catch(() => {
        });
        if (committeeId) {
          const cmtRes = await committeeService.getStudents(committeeId).catch(() => ({ data: [] }));
          const cmtStudentIds = cmtRes.data.map((s) => s.studentId || s.id);
          const thesisMap = {};
          await Promise.all(cmtStudentIds.map(async (sid) => {
            try {
              const t = await thesisService.getThesisByStudent(sid);
              const thesis = t.data;
              if (thesis?.id) thesisMap[sid] = thesis.id;
            } catch {
            }
          }));
          const cmtDisplayStudents = cmtStudentIds.map((sid) => ({
            id: sid,
            name: resolveName(sid, userMap, "Тодорхойгүй оюутан"),
            thesis: students.find((s) => s.studentId === sid)?.thesis || "Гарчиггүй",
            thesisId: thesisMap[sid],
            stage: students.find((s) => s.studentId === sid)?.stage || "",
            status: students.find((s) => s.studentId === sid)?.status || "",
            progress: students.find((s) => s.studentId === sid)?.progress || 0,
            studentId: sid
          }));
          setCommitteeStudents(cmtDisplayStudents);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId, committeeId]);
  useEffect$a(() => {
    if (!committeeId || !teacherId) return;
    committeeService.getMyAssignments(teacherId).then((res) => {
      const assignment = res.data.find((a) => a.committeeId === committeeId);
      if (assignment?.role) setTeacherRole(assignment.role);
    }).catch(() => {
    });
    committeeService.getById(committeeId).then((res) => setSecretaryDone(res.data?.status === "CLOSED")).catch(() => {
    });
    if (stageType) {
      workflowService.getDefenseSessions({ stageType }).then((res) => {
        setAllSessions(res.data);
        const open = res.data.filter((s) => s.status === "OPEN" || s.status === "ACTIVE");
        const session = open.find((s) => s.committeeId === committeeId) || open[0];
        if (session) {
          setDefenseSessionId(session.id);
          committeeService.getReviewerAssignments({ committeeId }).then((r) => setReviewerAssignments(r.data)).catch(() => {
          });
          evaluationService.getReviewDocuments({ defenseSessionId: session.id }).then((r) => setUploadedReviews(r.data)).catch(() => {
          });
          evaluationService.getDefenseGrades({ defenseSessionId: session.id, evaluatorId: teacherId }).then((r) => {
            const map = {};
            (r.data || []).forEach((g) => {
              if (g.evaluatorId === teacherId) map[g.studentId] = Number(g.points);
            });
            setCommitteeGrades(map);
          }).catch(() => {
          });
          evaluationService.getDefenseGrades({ defenseSessionId: session.id }).then((r) => setSessionGrades(r.data.map((g) => ({
            studentId: g.studentId,
            evaluatorId: g.evaluatorId,
            evaluatorRole: g.evaluatorRole,
            points: Number(g.points),
            maxPoints: Number(g.maxPoints),
            isSubmitted: g.isSubmitted
          })))).catch(() => {
          });
          evaluationService.getSessionSubmissions(session.id).then((r) => setSessionSubmissions(r.data || [])).catch(() => {
          });
        }
      }).catch(() => {
      });
    }
    committeeService.getMembers(committeeId).then((res) => setCommitteeMembers(res.data)).catch(() => {
    });
    Promise.all([
      userService.getTeachers().catch(() => ({ data: [] })),
      userService.getExternalExperts().catch(() => ({ data: [] }))
    ]).then(([tRes, eRes]) => {
      const map = {};
      [...tRes.data, ...eRes.data].forEach((u) => {
        map[u.id] = u.displayName;
        if (u.username) map[u.username] = u.displayName;
      });
      setTeacherNameMap(map);
    });
  }, [committeeId, teacherId, stageType]);
  useEffect$a(() => {
    if (teacherRole !== "HEAD" || stageType !== "FINAL_DEFENSE" || committeeStudents.length === 0) return;
    Promise.all(
      committeeStudents.map(
        (s) => evaluationService.getSecretarySubmissions(s.studentId).then((r) => [s.studentId, r.data])
      )
    ).then((results) => {
      const map = {};
      results.forEach(([sid, subs]) => {
        map[sid] = subs;
      });
      setStudentSubmissions(map);
    });
    Promise.all(
      committeeStudents.map(
        (s) => evaluationService.getDefenseGrades({ studentId: s.studentId }).then((r) => [s.studentId, r.data])
      )
    ).then((results) => {
      const map = {};
      results.forEach(([sid, gs]) => {
        map[sid] = gs;
      });
      setStudentGrades(map);
    });
    Promise.all([
      workflowService.getDefenseSessions({ stageType: "PROGRESS_1" }),
      workflowService.getDefenseSessions({ stageType: "PROGRESS_2" }),
      workflowService.getDefenseSessions({ stageType: "PRE_DEFENSE" }),
      workflowService.getDefenseSessions({ stageType: "FINAL_DEFENSE" })
    ]).then((rs) => {
      const merged = rs.flatMap((r) => r.data);
      setAllSessions((prev) => {
        const byId = new Map(prev.map((s) => [s.id, s]));
        merged.forEach((s) => byId.set(s.id, s));
        return Array.from(byId.values());
      });
    }).catch(() => {
    });
  }, [teacherRole, stageType, committeeStudents]);
  const handleReviewAction = (action) => {
    if (!reviewReportId) return;
    const decision = action === "approve" ? "REVIEWED" : "REVISION_REQUIRED";
    thesisService.reviewReport(reviewReportId, teacherId, decision, commentInput || void 0).then(() => {
      setReviewStatus("success");
      setSubmittedReports((prev) => prev.filter((r) => r.id !== reviewReportId));
      setTimeout(() => {
        setReviewStatus("idle");
        setReviewReportId(null);
        setCommentInput("");
      }, 2e3);
    }).catch(() => {
      setReviewStatus("error");
      setTimeout(() => setReviewStatus("idle"), 2e3);
    });
  };
  const handleSubmitEvaluation = async () => {
    if (!evalStudentId || !gradingScheme) return;
    const student = rosterStudents.find((s) => s.id === evalStudentId);
    const thesisId = student?.thesisId;
    const scheme = getEffectiveScheme(evalStudentId) || gradingScheme;
    if (!defenseSessionId) {
      setEvalError("Идэвхтэй хамгаалалтын сесс олдсонгүй. Admin сессийг нээсэн эсэхийг шалгана уу.");
      return;
    }
    if (!thesisId) {
      setEvalError("Оюутны дипломын ажил олдсонгүй.");
      return;
    }
    setEvalStatus("loading");
    setEvalError(null);
    try {
      const saveRes = await evaluationService.saveGrade({
        defenseSessionId,
        thesisId,
        studentId: evalStudentId,
        evaluatorId: teacherId,
        evaluatorRole: teacherRole,
        points: totalScore,
        maxPoints: scheme.total
      });
      if (!saveRes.data?.id) {
        throw new Error("Серверийн хариу дээр id олдсонгүй — үнэлгээ хадгалагдаагүй.");
      }
      await evaluationService.submitGrade(saveRes.data.id);
      setCommitteeGrades((prev) => ({ ...prev, [evalStudentId]: totalScore }));
      setEvalStatus("success");
      setTimeout(() => {
        setEvalStatus("idle");
        setEvalStudentId(null);
        setScores({});
      }, 2e3);
    } catch (err) {
      console.error("[saveGrade]", err?.response?.status, err?.response?.data, err?.config?.url, err);
      const status = err?.response?.status;
      const raw = err?.response?.data;
      const msg = raw?.message || raw?.error || (typeof raw === "string" ? raw : "") || err?.message || "";
      setEvalError(
        status ? `HTTP ${status}${msg ? ` — ${msg}` : ""}` : msg || "Үнэлгээ илгээж чадсангүй. Дахин оролдоно уу."
      );
      setEvalStatus("error");
      setTimeout(() => setEvalStatus("idle"), 5e3);
    }
  };
  const handleCloseCommittee = async () => {
    if (!committeeId) return;
    setSecretarySubmitting(true);
    setSecretaryError(null);
    try {
      const graders = committeeMembers.filter(
        (m) => m.role === "HEAD" || m.role === "SECRETARY" || m.role === "MEMBER" || m.role === "EXTERNAL_EXPERT"
      );
      const already = new Set(sessionSubmissions.map((s) => s.studentId));
      const toSend = graders.length === 0 ? [] : committeeStudents.filter((stu) => {
        if (already.has(stu.studentId)) return false;
        const submittedCount = graders.reduce(
          (n, m) => n + (sessionGrades.some((g) => g.studentId === stu.studentId && g.evaluatorId === m.teacherId && g.isSubmitted) ? 1 : 0),
          0
        );
        return submittedCount === graders.length;
      });
      if (defenseSessionId && toSend.length > 0) {
        const results = await Promise.all(toSend.map(
          (stu) => evaluationService.sendAverageScore({
            defenseSessionId,
            committeeId,
            studentId: stu.studentId,
            secretaryId: teacherId
          }).then((r) => r.data).catch(() => null)
        ));
        const fresh = results.filter((x) => x != null);
        if (fresh.length > 0) {
          setSessionSubmissions((prev) => {
            const keep = prev.filter((p) => !fresh.some((f) => f.studentId === p.studentId));
            return [...keep, ...fresh];
          });
        }
      }
      await committeeService.closeCommittee(committeeId);
      setSecretaryDone(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "";
      setSecretaryError(typeof msg === "string" && msg ? msg : "Комиссын ажлыг дуусгаж чадсангүй.");
    } finally {
      setSecretarySubmitting(false);
    }
  };
  const handleExportCommitteeGrades = () => {
    const graders = committeeMembers.filter(
      (m) => m.role === "HEAD" || m.role === "SECRETARY" || m.role === "MEMBER" || m.role === "EXTERNAL_EXPERT"
    );
    const roleLabel = (r) => r === "HEAD" ? "Дарга" : r === "SECRETARY" ? "Нарийн бичиг" : r === "EXTERNAL_EXPERT" ? "Эксперт" : "Гишүүн";
    const headers = [
      "Оюутан",
      "Оюутны ID",
      ...graders.map((m) => `${teacherNameMap[m.teacherId] || m.teacherId} (${roleLabel(m.role)})`),
      "Дундаж",
      "Хамгийн их",
      "Төлөв",
      "Илгээсэн огноо"
    ];
    const rows = committeeStudents.map((stu) => {
      const cells = [stu.name || "", stu.studentId];
      let sum = 0, count = 0, maxTotal = 0;
      graders.forEach((m) => {
        const g = sessionGrades.find((x) => x.studentId === stu.studentId && x.evaluatorId === m.teacherId && x.isSubmitted);
        if (g) {
          cells.push(`${g.points}/${g.maxPoints}`);
          sum += g.points;
          maxTotal = g.maxPoints;
          count++;
        } else cells.push("—");
      });
      const avg = count > 0 ? sum / count : null;
      const sub = sessionSubmissions.find((s) => s.studentId === stu.studentId);
      cells.push(avg !== null ? avg.toFixed(2) : "—");
      cells.push(maxTotal ? String(maxTotal) : "—");
      cells.push(sub ? "Илгээсэн" : count === graders.length && graders.length > 0 ? "Бэлэн" : `${count}/${graders.length}`);
      cells.push(sub?.submittedAt ? sub.submittedAt.split("T")[0] : "—");
      return cells;
    });
    const escape = (v) => {
      const s = String(v ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    a.href = url;
    a.download = `committee-grades-${committeeId || "session"}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleSendAverage = async (studentId) => {
    if (!defenseSessionId || !committeeId) return;
    setSendAvgStatus((prev) => ({ ...prev, [studentId]: "loading" }));
    setSendAvgError((prev) => ({ ...prev, [studentId]: "" }));
    try {
      const res = await evaluationService.sendAverageScore({
        defenseSessionId,
        committeeId,
        studentId,
        secretaryId: teacherId
      });
      setSessionSubmissions((prev) => [...prev.filter((s) => s.studentId !== studentId), res.data]);
      setSendAvgStatus((prev) => ({ ...prev, [studentId]: "success" }));
    } catch (err) {
      const status = err?.response?.status;
      const raw = err?.response?.data;
      const msg = raw?.message || raw?.error || (typeof raw === "string" ? raw : "") || err?.message || "";
      setSendAvgError((prev) => ({ ...prev, [studentId]: status ? `HTTP ${status}${msg ? ` — ${msg}` : ""}` : msg || "Илгээж чадсангүй." }));
      setSendAvgStatus((prev) => ({ ...prev, [studentId]: "error" }));
    }
  };
  const handleReviewUpload = async () => {
    if (!reviewUploadStudentId || !reviewFile || !defenseSessionId) return;
    const student = rosterStudents.find((s) => s.id === reviewUploadStudentId);
    const thesisId = student?.thesisId || "";
    setReviewUploadStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", reviewFile);
      formData.append("defenseSessionId", defenseSessionId);
      formData.append("thesisId", thesisId);
      formData.append("studentId", reviewUploadStudentId);
      formData.append("reviewerId", teacherId);
      await evaluationService.uploadReviewDocument(formData);
      const refreshed = await evaluationService.getReviewDocuments({ defenseSessionId });
      setUploadedReviews(refreshed.data);
      setReviewUploadStatus("success");
      setTimeout(() => {
        setReviewUploadStatus("idle");
        setReviewUploadStudentId(null);
        setReviewFile(null);
      }, 2e3);
    } catch (err) {
      setReviewUploadStatus("error");
      setTimeout(() => setReviewUploadStatus("idle"), 3e3);
    }
  };
  const handleAssignReviewer = async (studentId, reviewerId) => {
    if (!defenseSessionId || !committeeId) return;
    setAssigningReviewer((prev) => ({ ...prev, [studentId]: true }));
    try {
      const res = await committeeService.assignReviewer({
        committeeId,
        defenseSessionId,
        studentId,
        reviewerId,
        assignedBy: teacherId
      });
      setReviewerAssignments((prev) => [...prev.filter((a) => a.studentId !== studentId), res.data]);
    } catch {
    } finally {
      setAssigningReviewer((prev) => ({ ...prev, [studentId]: false }));
    }
  };
  const getStatusBadge = (status) => {
    const map = {
      ACTIVE: { label: "Хийгдэж байна", tone: "neutral" },
      SUBMITTED: { label: "Хянагдаж байна", tone: "warning" },
      DRAFT: { label: "Ноорог", tone: "neutral" },
      APPROVED: { label: "Батлагдсан", tone: "positive" }
    };
    const cfg = map[status] || { label: status, tone: "neutral" };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 whitespace-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5[cfg.tone]}` }),
      cfg.label
    ] });
  };
  const rosterStudents = committeeId ? committeeStudents : assignedStudents;
  const filteredStudents = rosterStudents.filter(
    (s) => (s.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const selectedReport = submittedReports.find((r) => r.id === reviewReportId);
  const isSecretary = teacherRole === "SECRETARY";
  const isHead = teacherRole === "HEAD";
  const canUploadReview = stageType === "PRE_DEFENSE" || stageType === "FINAL_DEFENSE";
  const canAssignReviewer = isHead && stageType === "PRE_DEFENSE";
  const canConfirmGrade = isHead && stageType === "FINAL_DEFENSE";
  const canonicalStage = (s) => s === "PRE_DEFENSE" ? "PRELIMINARY" : s === "FINAL_DEFENSE" ? "FINAL" : s;
  const getStageScore = (studentId, stage) => {
    const target = canonicalStage(stage);
    const subs = studentSubmissions[studentId] || [];
    for (const sub of subs) {
      const sess = allSessions.find((s) => s.id === sub.defenseSessionId);
      if (sess && canonicalStage(sess.stageType) === target) return sub.averageScore;
    }
    const grades = studentGrades[studentId] || [];
    const stageSessionIds = allSessions.filter((s) => canonicalStage(s.stageType) === target).map((s) => s.id);
    const matching = grades.filter(
      (g) => stageSessionIds.includes(g.defenseSessionId) && g.isSubmitted && g.evaluatorRole !== "REVIEWER"
    );
    if (matching.length === 0) return void 0;
    return matching.reduce((sum, g) => sum + g.points, 0) / matching.length;
  };
  const suggestGrade = (total) => {
    if (total >= 90) return "A";
    if (total >= 80) return "B";
    if (total >= 70) return "C";
    if (total >= 60) return "D";
    return "F";
  };
  const handleConfirmGrade = async (student) => {
    const sid = student.studentId;
    if (!committeeId) return;
    const p1 = getStageScore(sid, "PROGRESS_1");
    const p2 = getStageScore(sid, "PROGRESS_2");
    const pre = getStageScore(sid, "PRE_DEFENSE");
    const fin = getStageScore(sid, "FINAL_DEFENSE");
    const total = (p1 ?? 0) + (p2 ?? 0) + (pre ?? 0) + (fin ?? 0);
    const state = confirmState[sid] || { gradeLetter: suggestGrade(total), headNotes: "", submitting: false, done: false, error: null };
    setConfirmState((prev) => ({ ...prev, [sid]: { ...state, submitting: true, error: null } }));
    try {
      await evaluationService.confirmFinalGrade({
        studentId: sid,
        thesisId: student.thesisId || "",
        committeeId,
        confirmedBy: teacherId,
        progress1Score: p1,
        progress2Score: p2,
        preliminaryScore: pre,
        finalCommitteeScore: fin,
        gradeLetter: state.gradeLetter || suggestGrade(total),
        passFail: total >= 50 ? "PASS" : "FAIL",
        headNotes: state.headNotes || void 0
      });
      setConfirmState((prev) => ({ ...prev, [sid]: { ...state, submitting: false, done: true, error: null } }));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "";
      setConfirmState((prev) => ({
        ...prev,
        [sid]: { ...state, submitting: false, done: false, error: typeof msg === "string" && msg ? msg : "Баталгаажуулахад алдаа гарлаа." }
      }));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-7xl mx-auto pb-10", children: [
    committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate(-1), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
      " Буцах"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-accent transition-all duration-700", style: { width: `${committeeId && committeeStudents.length > 0 ? Math.round(Object.keys(committeeGrades).length / committeeStudents.length * 100) : rosterStudents.length > 0 ? 100 : 0}%` } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
              committeeId ? "Комиссын үнэлгээ идэвхтэй" : "Удирдсан оюутны жагсаалт"
            ] }),
            committeeId && teacherRole && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5", children: teacherRole }),
            committeeId && gradingScheme && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1 tabular-nums", children: [
              gradingScheme.total,
              " оноо"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-ink-900 tracking-tight leading-tight", children: committeeId ? gradingScheme?.label || "Комиссын оюутнууд" : "Хуваарилагдсан оюутнууд" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1", children: committeeId ? "Комиссын гишүүний хувьд үнэлгээ өгч, шаардлагатай үйлдлээ хийнэ үү." : "Суралцагчдын явцыг хянах, тайланг шалгах, үнэлгээгээ илгээх боломжтой." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 border border-border rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold text-ink-900 tabular-nums tracking-tight", children: rosterStudents.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1", children: "Оюутан" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "roster", children: "Оюутны жагсаалт" }),
        !committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "reports", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          "Илгээсэн тайлангууд",
          submittedReports.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums", children: submittedReports.length })
        ] }) }),
        !committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "schedule", children: "Явц 1 хуваарь" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "evaluations", children: [
          "Үнэлгээний маягт ",
          committeeId && gradingScheme && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-[10px] text-ink-400 tabular-nums", children: [
            "(",
            gradingScheme.total,
            " оноо)"
          ] })
        ] }),
        isSecretary && committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "secretary", children: "Дундаж оноо илгээх" }),
        canUploadReview && committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "reviewer", children: "Шүүмж баримт" }),
        canAssignReviewer && committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "head", children: "Шүүмжлэгч томилох" }),
        canConfirmGrade && committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "confirm", children: "Дүн баталгаажуулах" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "roster", className: "mt-6", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-ink-400 text-sm", children: "Ачааллаж байна..." }) : filteredStudents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-ink-400 text-sm bg-surface-muted rounded-md border border-border", children: committeeId ? "Комиссын оюутан олдсонгүй." : "Оюутан олдсонгүй." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredStudents.map((student) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "hover:border-accent transition-colors overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-accent transition-all", style: { width: `${student.progress}%` } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10 border border-border-strong shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: (student.name || "??").substring(0, 2).toUpperCase() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-ink-900 tracking-tight truncate", children: student.name }),
              getStatusBadge(student.status)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 line-clamp-2 mb-3 min-h-[2.5rem]", children: student.thesis }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs mb-4 rounded-md border border-border bg-surface-muted px-2.5 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-ink-700", children: [
                "Шат: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-900 font-medium", children: student.stage })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-ink-500 tabular-nums", children: [
                student.progress,
                "%"
              ] })
            ] }),
            committeeId && committeeGrades[student.studentId] !== void 0 && gradingScheme && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Таны үнэлгээ: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-ink-900 tabular-nums", children: [
                  committeeGrades[student.studentId],
                  "/",
                  gradingScheme.total
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "flex-1 text-xs",
                  onClick: () => openStudentReports(student),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                    " Харах"
                  ]
                }
              ),
              !committeeId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "flex-1 text-xs", onClick: () => setActiveTab("reports"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                " Хянах"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "flex-1 text-xs", onClick: () => {
                setActiveTab("evaluations");
                setEvalStudentId(student.id);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                " ",
                committeeGrades[student.studentId] !== void 0 ? "Засах" : "Үнэлэх"
              ] })
            ] })
          ] })
        ] }) })
      ] }, student.id)) }) }),
      !committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "reports", className: "mt-6", children: reviewReportId === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Тайлан хянах дараалал" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-ink-400 text-sm", children: "Ачааллаж байна..." }) : submittedReports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-ink-400 text-sm", children: "Хянах тайлан байхгүй байна." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: submittedReports.map((report) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-md flex items-center justify-center shrink-0 border border-border bg-accent-softer text-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5", strokeWidth: 1.6 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-ink-900 tracking-tight", children: resolveName(report.studentId, studentNameMap, "Тодорхойгүй оюутан") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-ink-500 border border-border rounded-sm uppercase tracking-wide px-1.5 py-0.5", children: report.reportType })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-600 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5", strokeWidth: 1.6 }),
                " Дипломын тайлан"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-400 mt-1 flex items-center gap-1 tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3", strokeWidth: 1.6 }),
                " Илгээсэн: ",
                report.submittedAt?.split("T")[0] || "Огноогүй"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between md:justify-end gap-4 w-full md:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.warning}` }),
              "Хянах шаардлагатай"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
              setReviewReportId(report.id);
              setReviewFiles([]);
              setActiveFileId(null);
              thesisService.getReportFiles(report.id).then((r) => {
                setReviewFiles(r.data);
                if (r.data.length > 0) setActiveFileId(r.data[0].id);
              }).catch(() => {
              });
            }, children: [
              "Хянах нээх ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3.5 h-3.5 ml-1", strokeWidth: 1.6 })
            ] })
          ] })
        ] }, report.id)) }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 h-[800px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-2 overflow-hidden flex flex-col p-0", children: [
          reviewFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 px-3 py-2 border-b border-border bg-surface-muted overflow-x-auto shrink-0", children: [
            reviewFiles.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setActiveFileId(f.id),
                className: `flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors shrink-0 ${activeFileId === f.id ? "bg-accent text-white" : "bg-surface border border-border text-ink-700 hover:border-accent"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3", strokeWidth: 1.6 }),
                  f.originalFilename.length > 24 ? f.originalFilename.slice(0, 22) + "…" : f.originalFilename
                ]
              },
              f.id
            )),
            activeFileId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `http://localhost:8083/api/thesis-reports/files/${activeFileId}/download`,
                className: "ml-auto shrink-0 flex items-center gap-1 text-xs text-ink-500 hover:text-accent px-2 py-1.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5", strokeWidth: 1.6 }),
                  " Татах"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-surface-sunken overflow-hidden", children: reviewFiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center h-full text-ink-400 text-sm flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-10 h-10 text-ink-200", strokeWidth: 1.4 }),
            "Хавсаргасан файл байхгүй байна."
          ] }) : activeFileId ? (() => {
            const af = reviewFiles.find((f) => f.id === activeFileId);
            const fn = af?.originalFilename?.toLowerCase() ?? "";
            const mt = af?.mimeType?.toLowerCase() ?? "";
            const previewable = mt.includes("pdf") || mt.includes("image/") || fn.endsWith(".pdf") || fn.endsWith(".png") || fn.endsWith(".jpg") || fn.endsWith(".jpeg");
            return previewable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "iframe",
              {
                src: `http://localhost:8083/api/thesis-reports/files/${activeFileId}/view`,
                className: "w-full h-full border-0",
                title: af?.originalFilename
              },
              activeFileId
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-4 text-ink-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-14 h-14 text-ink-200", strokeWidth: 1.4 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Энэ файлыг шууд харах боломжгүй" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `http://localhost:8083/api/thesis-reports/files/${activeFileId}/download`,
                  className: "flex items-center gap-2 bg-accent text-white text-[13px] px-4 py-1.5 rounded-md hover:bg-accent-hover",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-4 h-4", strokeWidth: 1.6 }),
                    " Татаж авах"
                  ]
                }
              )
            ] });
          })() : null })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col p-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "mb-3 -ml-2", onClick: () => {
              setReviewReportId(null);
              setCommentInput("");
              setReviewStatus("idle");
              setReviewFiles([]);
              setActiveFileId(null);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3.5 h-3.5 mr-1 rotate-180", strokeWidth: 1.6 }),
              " Дараалал руу буцах"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-ink-900 tracking-tight", children: selectedReport ? resolveName(selectedReport.studentId, studentNameMap, "Тодорхойгүй оюутан") : "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mb-2", children: selectedReport?.reportType }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.warning}` }),
              "Хянах шаардлагатай"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-4 overflow-y-auto space-y-3 bg-surface-muted", children: [
            reviewStatus === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface p-3 rounded-md flex items-center gap-2 text-sm text-ink-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
              "Үйлдэл амжилттай бүртгэгдлээ!"
            ] }),
            reviewStatus === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface p-3 rounded-md flex items-center gap-2 text-sm text-ink-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
              "Алдаа гарлаа. Дахин оролдоно уу."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                className: "w-full text-[13px] border border-border rounded-md p-3 outline-none focus:border-accent resize-none h-24 bg-surface",
                placeholder: "Санал хүсэлтээ бичнэ үү...",
                value: commentInput,
                onChange: (e) => setCommentInput(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleReviewAction("revision"), disabled: reviewStatus !== "idle", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                " Засвар хүсэх"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => handleReviewAction("approve"), disabled: reviewStatus !== "idle", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                " Зөвшөөрөх"
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "evaluations", className: "mt-6", children: !gradingScheme ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center py-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-5 h-5 text-ink-400", strokeWidth: 1.6 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-ink-900 tracking-tight", children: "Комиссоор нэвтрэнэ үү" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1.5 max-w-sm mx-auto", children: 'Үнэлгээний маягтыг ашиглахын тулд "Комисс" хуудаснаас "Үнэлэх" товчийг дарна уу.' })
      ] }) }) : evalStudentId === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-ink-900 tracking-tight", children: gradingScheme.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5 tabular-nums", children: [
              gradingScheme.total,
              " оноо"
            ] }),
            !defenseSessionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.warning}` }),
              "Идэвхтэй сесс олдсонгүй"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: gradingScheme.criteria.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md px-3 py-1.5 text-xs bg-surface", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-ink-600", children: [
              c.name,
              ":"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-accent ml-1.5 tabular-nums", children: c.max })
          ] }, i)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: (committeeId ? committeeStudents : assignedStudents).map((student) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:border-accent transition-colors cursor-pointer", onClick: () => setEvalStudentId(student.id), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: (student.name || "??").substring(0, 2).toUpperCase() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight truncate", children: student.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate", children: student.thesis })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
            " Үнэлэх"
          ] })
        ] }) }, student.id)) })
      ] }) : (() => {
        const evalScheme = getEffectiveScheme(evalStudentId) || gradingScheme;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "max-w-3xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "border-b border-border pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-3 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: evalScheme.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [
                  stageType && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5", children: stageType }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-600 bg-surface-muted border border-border rounded-sm px-2 py-0.5 tabular-nums", children: [
                    "Нийт: ",
                    evalScheme.total,
                    " оноо"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-600 bg-surface-muted border border-border rounded-sm px-2 py-0.5", children: [
                    "Үүрэг: ",
                    teacherRole
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                setEvalStudentId(null);
                setScores({});
                setEvalError(null);
              }, children: "Хаах" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
              "Үнэлж байгаа: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-ink-900", children: rosterStudents.find((s) => s.id === evalStudentId)?.name || evalStudentId })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-4 px-4 py-3 bg-surface-muted text-[11px] font-medium uppercase tracking-wider text-ink-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6", children: "Үнэлгээний шалгуур" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 text-center", children: "Оноо" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 text-center", children: "Дээд" })
            ] }),
            evalScheme.criteria.map((criterion, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-surface-muted transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-900 font-medium", children: criterion.name }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: criterion.max,
                  className: "w-16 border border-border rounded-md py-1.5 px-2 text-center text-[13px] focus:outline-none focus:border-accent bg-surface tabular-nums",
                  value: scores[idx] || "",
                  onChange: (e) => setScores({ ...scores, [idx]: Math.min(criterion.max, parseInt(e.target.value) || 0) })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 text-center text-ink-500 text-sm tabular-nums", children: [
                "/ ",
                criterion.max
              ] })
            ] }, idx)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-surface-muted border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-ink-900 tracking-tight", children: "Нийт оноо" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1.5 tabular-nums", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-3xl font-semibold ${totalScore > evalScheme.total ? "text-[var(--color-dot-negative)]" : "text-accent"}`, children: totalScore }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-ink-500 text-sm", children: [
                    "/ ",
                    evalScheme.total
                  ] })
                ] })
              ] }),
              totalScore > evalScheme.total && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--color-dot-negative)] mb-3 inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
                "Нийт оноо хэтэрсэн байна."
              ] }),
              evalError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm mb-3 inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
                evalError
              ] }),
              evalStatus === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                "Үнэлгээ амжилттай хадгалагдлаа!"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: "w-full",
                  size: "lg",
                  onClick: handleSubmitEvaluation,
                  disabled: evalStatus === "loading" || totalScore > evalScheme.total || totalScore === 0,
                  children: evalStatus === "loading" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" }),
                    "Илгааж байна..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
                    "Үнэлгээ илгээх"
                  ] })
                }
              )
            ] })
          ] }) })
        ] });
      })() }),
      isSecretary && committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "secretary", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            " Нарийн бичгийн даргын үүрэг"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700", children: "Комиссын хамгаалалт бүрэн дууссаны дараа доорх товчийг дарж хамгаалалтын сессийг хаана уу. Энэ үйлдлийг буцаах боломжгүй." }),
          !defenseSessionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
            "Идэвхтэй хамгаалалтын сесс олдсонгүй."
          ] })
        ] }) }),
        secretaryError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
          secretaryError
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          (() => {
            const committeeGraders = committeeMembers.filter(
              (m) => m.role === "HEAD" || m.role === "SECRETARY" || m.role === "MEMBER" || m.role === "EXTERNAL_EXPERT"
            );
            const roleLabel = (r) => r === "HEAD" ? "Дарга" : r === "SECRETARY" ? "Нарийн бичиг" : r === "EXTERNAL_EXPERT" ? "Эксперт" : "Гишүүн";
            const submissionFor = (sid) => sessionSubmissions.find((s) => s.studentId === sid);
            if (committeeStudents.length === 0) {
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4 text-center text-ink-400 text-sm", children: "Оюутан олдсонгүй." });
            }
            if (committeeGraders.length === 0) {
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4 text-center text-ink-400 text-sm", children: "Комиссийн гишүүд бүртгэгдээгүй байна." });
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-[13px] border-separate border-spacing-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border sticky left-0 z-10", children: "Оюутан" }),
                committeeGraders.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-center px-3 py-2 bg-surface-muted border-b border-border whitespace-nowrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-ink-700 font-medium", children: teacherNameMap[m.teacherId] || m.teacherId.slice(0, 8) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-ink-400 font-normal mt-0.5", children: roleLabel(m.role) })
                ] }, m.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border whitespace-nowrap", children: "Дундаж" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border", children: "Төлөв" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border", children: "Үйлдэл" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: committeeStudents.map((student) => {
                const gradesForStudent = committeeGraders.map(
                  (m) => sessionGrades.find(
                    (g) => g.studentId === student.studentId && g.evaluatorId === m.teacherId && g.isSubmitted
                  )
                );
                const graded = gradesForStudent.filter(Boolean);
                const allGraded = graded.length === committeeGraders.length;
                const avg = graded.length > 0 ? graded.reduce((sum, g) => sum + g.points, 0) / graded.length : null;
                const sub = submissionFor(student.studentId);
                const status = sendAvgStatus[student.studentId] || "idle";
                const err = sendAvgError[student.studentId];
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface-muted", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 border-b border-border sticky left-0 bg-surface hover:bg-surface-muted z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-8 w-8 shrink-0 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-[11px] font-medium", children: (student.name || "??").substring(0, 2).toUpperCase() }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tracking-tight truncate", children: student.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-ink-400 truncate", children: student.studentId })
                    ] })
                  ] }) }),
                  gradesForStudent.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center px-3 py-2 border-b border-border tabular-nums", children: g ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-ink-900", children: [
                    g.points,
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-ink-400 font-normal", children: [
                      "/",
                      g.maxPoints
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-300", children: "—" }) }, i)),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center px-3 py-2 border-b border-border", children: avg !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${allGraded ? toneDot$5.positive : toneDot$5.neutral}` }),
                    avg.toFixed(2)
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-300", children: "—" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center px-3 py-2 border-b border-border", children: sub ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                    "Илгээсэн"
                  ] }) : allGraded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-accent", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.info}` }),
                    "Бэлэн"
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.warning}` }),
                    graded.length,
                    "/",
                    committeeGraders.length
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-3 py-2 border-b border-border", children: sub ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-500 tabular-nums", children: sub.submittedAt?.split("T")[0] || "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        disabled: !allGraded || status === "loading",
                        onClick: () => handleSendAverage(student.studentId),
                        children: status === "loading" ? "Илгээж..." : "Илгээх"
                      }
                    ),
                    err && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[var(--color-dot-negative)] max-w-[160px] truncate", title: err, children: err })
                  ] }) })
                ] }, student.id);
              }) })
            ] }) });
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                disabled: committeeStudents.length === 0,
                onClick: handleExportCommitteeGrades,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
                  " Excel татах"
                ]
              }
            ),
            secretaryDone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-sm text-ink-900 font-medium px-4 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
              "Комиссын ажил дууссан"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: !committeeId || secretarySubmitting,
                onClick: handleCloseCommittee,
                children: secretarySubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" }),
                  "Хадгалж байна..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
                  "Хамгаалалт дуусгах"
                ] })
              }
            )
          ] })
        ] }) })
      ] }) }),
      canUploadReview && committeeId && (() => {
        const myAssignedStudents = committeeStudents.filter(
          (s) => reviewerAssignments.some((a) => a.studentId === s.studentId && a.reviewerId === teacherId)
        );
        const hasReviewFor = (studentId) => uploadedReviews.find((r) => r.studentId === studentId && r.reviewerId === teacherId);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "reviewer", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
              " Шүүмжлэгчийн үүрэг"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700", children: 'Танд шүүмжлэгчээр томилогдсон оюутны дипломын ажлыг уншиж шүүмжилсэн баримт бичиг байршуулна уу. Байршуулсны дараа оюутан өөрийн "Санал хүсэлт" хуудсаас харах боломжтой.' }),
            !defenseSessionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
              "Идэвхтэй хамгаалалтын сесс олдсонгүй."
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: myAssignedStudents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-ink-400 text-sm", children: "Танд шүүмжлэх оюутан томилогдоогүй байна. Комиссийн дарга томилсон бол энд харагдана." }) : myAssignedStudents.map((student) => {
            const sent = hasReviewFor(student.studentId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border last:border-b-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 gap-3 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: (student.name || "??").substring(0, 2).toUpperCase() }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight truncate", children: student.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate max-w-[220px]", children: student.thesis })
                  ] })
                ] }),
                sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                  "Илгээсэн: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-500 truncate max-w-[160px]", children: sent.originalFilename })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    disabled: !defenseSessionId,
                    onClick: () => {
                      setReviewUploadStudentId(student.studentId);
                      setReviewFile(null);
                      setReviewUploadStatus("idle");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                      " Шүүмж байршуулж илгээх"
                    ]
                  }
                )
              ] }),
              reviewUploadStudentId === student.studentId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-muted rounded-md p-4 border border-border space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      ref: fileInputRef,
                      type: "file",
                      accept: ".pdf,.doc,.docx",
                      className: "hidden",
                      onChange: (e) => setReviewFile(e.target.files?.[0] || null)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "outline",
                      size: "sm",
                      onClick: () => fileInputRef.current?.click(),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                        " Файл сонгох"
                      ]
                    }
                  ),
                  reviewFile && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-ink-700 flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 text-accent", strokeWidth: 1.6 }),
                    " ",
                    reviewFile.name,
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReviewFile(null), className: "text-ink-400 hover:text-[var(--color-dot-negative)]", "aria-label": "Файлыг устгах", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5", strokeWidth: 1.6 }) })
                  ] })
                ] }),
                reviewUploadStatus === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                  "Шүүмж амжилттай байршлаа!"
                ] }),
                reviewUploadStatus === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
                  "Байршуулахад алдаа гарлаа. Дахин оролдоно уу."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      onClick: () => {
                        setReviewUploadStudentId(null);
                        setReviewFile(null);
                      },
                      children: "Цуцлах"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      disabled: !reviewFile || !defenseSessionId || reviewUploadStatus === "uploading",
                      onClick: handleReviewUpload,
                      children: reviewUploadStatus === "uploading" ? "Илгээж байна..." : "Оюутанд илгээх"
                    }
                  )
                ] })
              ] })
            ] }, student.id);
          }) }) })
        ] }) });
      })(),
      canAssignReviewer && committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "head", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            " Комиссийн даргын үүрэг"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700", children: "Урьдчилсан хамгаалалтын үеэр оюутан бүрт шүүмжлэгч (шүүмжилсэн баримт бичих гишүүн) томилно уу." }),
          !defenseSessionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
            "Идэвхтэй хамгаалалтын сесс олдсонгүй."
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: committeeStudents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-ink-400 text-sm", children: "Оюутан олдсонгүй." }) : committeeStudents.map((student) => {
          const existing = reviewerAssignments.find((a) => a.studentId === student.studentId);
          const roleLabel = (role) => {
            if (role === "HEAD") return "Дарга";
            if (role === "SECRETARY") return "Нарийн бичгийн дарга";
            if (role === "EXTERNAL_EXPERT") return "Гадаад эксперт";
            return "Гишүүн";
          };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border last:border-b-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: (student.name || "??").substring(0, 2).toUpperCase() }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight truncate", children: student.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate max-w-[220px]", children: student.thesis })
                ] })
              ] }),
              existing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                "Шүүмжлэгч: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-900 font-medium", children: teacherNameMap[existing.reviewerId] || existing.reviewerId })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.neutral}` }),
                "Томилогдоогүй"
              ] })
            ] }),
            !existing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "flex-1 border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:border-accent bg-surface disabled:bg-surface-muted disabled:text-ink-400",
                  defaultValue: "",
                  onChange: async (e) => {
                    if (e.target.value) {
                      await handleAssignReviewer(student.studentId, e.target.value);
                      e.target.value = "";
                    }
                  },
                  disabled: !defenseSessionId || assigningReviewer[student.studentId],
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Шүүмжлэгч сонгох —" }),
                    committeeMembers.filter((m) => m.teacherId !== teacherId && m.role !== "HEAD").map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: m.teacherId, children: [
                      teacherNameMap[m.teacherId] || m.teacherId,
                      " (",
                      roleLabel(m.role),
                      ")"
                    ] }, m.teacherId))
                  ]
                }
              ),
              assigningReviewer[student.studentId] && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-400", children: "Томилж байна..." })
            ] })
          ] }, student.id);
        }) }) })
      ] }) }),
      canConfirmGrade && committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "confirm", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            " Комиссийн даргын эцсийн баталгаажуулалт"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700", children: "Бүх шатны нарийн бичгийн дундаж оноонууд автоматаар татагдана. Дүнгийн үсгийг шалгаж, тэмдэглэл нэмээд баталгаажуулна уу. Баталгаажуулсны дараа Admin нийтэлнэ." }),
          !defenseSessionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
            "Идэвхтэй FINAL_DEFENSE сесс олдсонгүй."
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: committeeStudents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-ink-400 text-sm bg-surface-muted rounded-md border border-border", children: "Оюутан олдсонгүй." }) : committeeStudents.map((student) => {
          const sid = student.studentId;
          const p1 = getStageScore(sid, "PROGRESS_1");
          const p2 = getStageScore(sid, "PROGRESS_2");
          const pre = getStageScore(sid, "PRE_DEFENSE");
          const fin = getStageScore(sid, "FINAL_DEFENSE");
          const total = (p1 ?? 0) + (p2 ?? 0) + (pre ?? 0) + (fin ?? 0);
          const suggested = suggestGrade(total);
          const cs = confirmState[sid] || { gradeLetter: suggested, headNotes: "", submitting: false, done: false, error: null };
          const allScoresReady = p1 !== void 0 && p2 !== void 0 && pre !== void 0 && fin !== void 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: cs.done ? "bg-surface-muted" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: (student.name || "??").substring(0, 2).toUpperCase() }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight", children: student.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate max-w-[220px]", children: student.thesis })
                ] })
              ] }),
              cs.done && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                "Баталгаажсан"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: [
              { label: "Явц 1", score: p1, max: 15 },
              { label: "Явц 2", score: p2, max: 20 },
              { label: "Урьдч.", score: pre, max: 25 },
              { label: "Эцсийн", score: fin, max: 40 }
            ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md p-3 text-center tabular-nums ${item.score !== void 0 ? "bg-surface border border-border" : "bg-surface-muted border border-dashed border-border-strong"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-ink-500 mb-1", children: item.label }),
              item.score !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-semibold text-ink-900", children: [
                item.score.toFixed(1),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-ink-400 font-normal", children: [
                  "/",
                  item.max
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-400", children: "—" })
            ] }, item.label)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-surface-muted rounded-md px-4 py-3 border border-border tabular-nums", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500", children: "Нийт оноо" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-2xl font-semibold ${total >= 80 ? "text-[var(--color-dot-positive)]" : total >= 60 ? "text-[var(--color-dot-warning)]" : "text-[var(--color-dot-negative)]"}`, children: total.toFixed(1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-400 text-sm", children: "/100" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-md text-base font-semibold border ${total >= 80 ? "border-border bg-accent-softer text-accent" : total >= 60 ? "border-border bg-surface text-[var(--color-dot-warning)]" : "border-border bg-surface text-[var(--color-dot-negative)]"}`, children: suggested })
              ] })
            ] }),
            !allScoresReady && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-700 bg-surface-muted border border-border rounded-md px-3 py-2 inline-flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.warning}` }),
              "Зарим шатны нарийн бичгийн оноо ирээгүй байна. Бүх оноо ирсний дараа баталгаажуулна уу."
            ] }),
            !cs.done && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 block mb-1.5", children: "Дүнгийн үсэг" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    className: "w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface font-semibold",
                    value: cs.gradeLetter,
                    onChange: (e) => setConfirmState((prev) => ({
                      ...prev,
                      [sid]: { ...cs, gradeLetter: e.target.value }
                    })),
                    children: ["A", "B", "C", "D", "F"].map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g, children: g }, g))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 block mb-1.5", children: "Даргын тэмдэглэл (заавал биш)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    className: "w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface",
                    placeholder: "Нэмэлт тэмдэглэл...",
                    value: cs.headNotes,
                    onChange: (e) => setConfirmState((prev) => ({
                      ...prev,
                      [sid]: { ...cs, headNotes: e.target.value }
                    }))
                  }
                )
              ] })
            ] }),
            cs.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
              cs.error
            ] }),
            !cs.done && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "w-full",
                disabled: cs.submitting || !defenseSessionId,
                onClick: () => handleConfirmGrade(student),
                children: cs.submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" }),
                  "Баталгаажуулж байна..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
                  "Эцсийн дүн баталгаажуулах"
                ] })
              }
            )
          ] }) }, sid);
        }) })
      ] }) }),
      !committeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "schedule", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-accent", strokeWidth: 1.6 }),
            progress1Session ? "Явц 1 хуваарийг засах" : "Явц 1 хуваарь үүсгэх"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5", children: "Огноо, цаг" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "datetime-local",
                  className: "w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface",
                  value: scheduleForm.scheduledDate,
                  onChange: (e) => setScheduleForm((f) => ({ ...f, scheduledDate: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5", children: "Байршил / Өрөө" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Жнь: 305 тоот, A байр",
                  className: "w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface",
                  value: scheduleForm.location,
                  onChange: (e) => setScheduleForm((f) => ({ ...f, location: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5", children: "Нэмэлт тэмдэглэл" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  rows: 3,
                  placeholder: "Оюутнуудад мэдэгдэх мэдээлэл...",
                  className: "w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent resize-none bg-surface",
                  value: scheduleForm.notes,
                  onChange: (e) => setScheduleForm((f) => ({ ...f, notes: e.target.value }))
                }
              )
            ] }),
            scheduleStatus === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
              "Хуваарь амжилттай хадгалагдлаа!"
            ] }),
            scheduleStatus === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
              "Алдаа гарлаа. Дахин оролдоно уу."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "w-full",
                disabled: !scheduleForm.scheduledDate || scheduleStatus === "saving",
                onClick: async () => {
                  setScheduleStatus("saving");
                  try {
                    const payload = {
                      scheduledDate: scheduleForm.scheduledDate ? new Date(scheduleForm.scheduledDate).toISOString().replace("Z", "") : void 0,
                      location: scheduleForm.location || void 0,
                      notes: scheduleForm.notes || void 0
                    };
                    let session;
                    if (progress1Session) {
                      const r = await workflowService.updateDefenseSession(progress1Session.id, payload);
                      session = r.data;
                    } else {
                      const r = await workflowService.createDefenseSession({ stageType: "PROGRESS_1", supervisorId: teacherId, ...payload });
                      session = r.data;
                    }
                    setProgress1Session(session);
                    setScheduleStatus("success");
                    setTimeout(() => setScheduleStatus("idle"), 3e3);
                  } catch {
                    setScheduleStatus("error");
                    setTimeout(() => setScheduleStatus("idle"), 3e3);
                  }
                },
                children: scheduleStatus === "saving" ? "Хадгалж байна..." : progress1Session ? "Шинэчлэх" : "Хуваарь үүсгэх"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-ink-500", strokeWidth: 1.6 }),
            p1GradeStudentId ? "Явц 1 · Үнэлгээ" : `Оюутнууд (${assignedStudents.length})`
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: p1GradeStudentId ? (
            /* ── Grading form ── */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-600", children: [
                "Үнэлж байгаа: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-ink-900", children: assignedStudents.find((s) => s.id === p1GradeStudentId)?.name || p1GradeStudentId })
              ] }),
              P1_CRITERIA.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-ink-700 flex-1", children: c.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    min: 0,
                    max: c.max,
                    className: "w-16 border border-border rounded-md py-1.5 px-2 text-center text-[13px] focus:outline-none focus:border-accent bg-surface tabular-nums",
                    value: p1Scores[i] ?? "",
                    onChange: (e) => setP1Scores((s) => ({ ...s, [i]: Math.min(c.max, parseInt(e.target.value) || 0) }))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-ink-400 w-10 text-right tabular-nums", children: [
                  "/ ",
                  c.max
                ] })
              ] }, i)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-3 border-t border-border tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500", children: "Нийт" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-semibold text-accent", children: [
                  Object.values(p1Scores).reduce((a, b) => a + b, 0),
                  " / 15"
                ] })
              ] }),
              p1GradeError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-700 border border-border bg-surface rounded-md px-3 py-2 inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.negative}` }),
                p1GradeError
              ] }),
              p1GradeStatus === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                "Үнэлгээ амжилттай хадгалагдлаа!"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => {
                  setP1GradeStudentId(null);
                  setP1Scores({});
                  setP1GradeError(null);
                }, children: "Буцах" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    className: "flex-1",
                    disabled: !progress1Session || p1GradeStatus === "loading" || Object.values(p1Scores).reduce((a, b) => a + b, 0) === 0,
                    onClick: async () => {
                      if (!progress1Session) return;
                      const student = assignedStudents.find((s) => s.id === p1GradeStudentId);
                      const thesisId = student?.thesisId || p1GradeStudentId || "";
                      const total = Object.values(p1Scores).reduce((a, b) => a + b, 0);
                      setP1GradeStatus("loading");
                      setP1GradeError(null);
                      try {
                        const res = await evaluationService.saveGrade({
                          defenseSessionId: progress1Session.id,
                          thesisId,
                          studentId: p1GradeStudentId,
                          evaluatorId: teacherId,
                          evaluatorRole: "SUPERVISOR",
                          points: total,
                          maxPoints: 15
                        });
                        if (!res.data?.id) throw new Error("Серверийн хариу дээр id олдсонгүй.");
                        await evaluationService.submitGrade(res.data.id);
                        setP1ExistingGrades((prev) => ({ ...prev, [p1GradeStudentId]: total }));
                        setP1GradeStatus("success");
                        setTimeout(() => {
                          setP1GradeStudentId(null);
                          setP1Scores({});
                          setP1GradeStatus("idle");
                        }, 2e3);
                      } catch (err) {
                        console.error("[p1 saveGrade]", err?.response?.status, err?.response?.data, err);
                        const status = err?.response?.status;
                        const raw = err?.response?.data;
                        const msg = raw?.message || raw?.error || (typeof raw === "string" ? raw : "") || err?.message || "";
                        setP1GradeError(status ? `HTTP ${status}${msg ? ` — ${msg}` : ""}` : msg || "Алдаа гарлаа.");
                        setP1GradeStatus("error");
                        setTimeout(() => setP1GradeStatus("idle"), 5e3);
                      }
                    },
                    children: p1GradeStatus === "loading" ? "Илгээж байна..." : "Үнэлгээ илгээх"
                  }
                )
              ] })
            ] })
          ) : (
            /* ── Student list ── */
            assignedStudents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-ink-400 text-sm", children: "Оюутан байхгүй байна." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: assignedStudents.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-8 w-8 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-[11px] font-medium", children: (s.name || "??").substring(0, 2).toUpperCase() }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tracking-tight truncate", children: s.name || "Тодорхойгүй оюутан" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-400 truncate", children: s.thesis && s.thesis !== "—" ? s.thesis : "Гарчиггүй ажил" })
              ] }),
              p1ExistingGrades[s.studentId] !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 shrink-0 tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$5.positive}` }),
                p1ExistingGrades[s.studentId],
                "/15"
              ] }),
              progress1Session ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "text-xs shrink-0",
                  onClick: () => {
                    setP1GradeStudentId(s.id);
                    setP1Scores({});
                    setP1GradeError(null);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3 h-3 mr-1", strokeWidth: 1.6 }),
                    " ",
                    p1ExistingGrades[s.studentId] !== void 0 ? "Засах" : "Үнэлэх"
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-400 shrink-0", children: "Хуваарь үүсгэнэ үү" })
            ] }, s.id)) })
          ) })
        ] })
      ] }) })
    ] }),
    viewReportsStudent && (viewReportsLoading || viewReportsError) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 bg-ink-900/40 z-50 flex items-center justify-center p-4",
        onClick: closeStudentReports,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-surface rounded-md border border-border p-8 max-w-sm w-full text-center",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-ink-900 tracking-tight mb-1", children: viewReportsStudent.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mb-4", children: viewReportsStudent.studentId }),
              viewReportsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-4 text-ink-500 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" }),
                "Тайланг ачаалж байна..."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-4 text-ink-600 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-10 h-10 text-ink-300", strokeWidth: 1.4 }),
                  viewReportsError
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: closeStudentReports, children: "Хаах" })
              ] })
            ]
          }
        )
      }
    ),
    viewReportsStudent && viewReportsFiles.length > 0 && viewReportsActiveId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilePreviewModal,
      {
        files: viewReportsFiles,
        activeId: viewReportsActiveId,
        onClose: closeStudentReports,
        onSelect: setViewReportsActiveId
      }
    )
  ] });
}

const React$2 = await importShared('react');
const Input = React$2.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-border-strong bg-surface",
          "px-3 py-1.5 text-sm text-ink-900 placeholder:text-ink-400",
          "transition-colors duration-150",
          "hover:border-ink-400",
          "focus:outline-none focus:border-ink-900 focus:ring-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-700",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

const React$1 = await importShared('react');
const Textarea = React$1.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-border-strong bg-surface",
          "px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 leading-relaxed",
          "transition-colors duration-150 resize-y",
          "hover:border-ink-400",
          "focus:outline-none focus:border-ink-900 focus:ring-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";

const {useState: useState$8,useEffect: useEffect$9} = await importShared('react');
const toneDot$4 = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]"
};
const statusMap$1 = {
  ACTIVE: { label: "Нийтэд нээлттэй", tone: "positive" },
  DRAFT: { label: "Ноорог", tone: "neutral" },
  DEPT_PENDING: { label: "Тэнхим хяналтанд", tone: "warning" },
  PENDING_DEPT_APPROVAL: { label: "Тэнхим хяналтанд", tone: "warning" },
  APPROVED: { label: "Батлагдсан", tone: "positive" },
  REJECTED: { label: "Татгалзсан", tone: "negative" }
};
function TeacherTopicManagementTab() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  const [topics, setTopics] = useState$8([]);
  const [loading, setLoading] = useState$8(true);
  const [showForm, setShowForm] = useState$8(false);
  const [submitting, setSubmitting] = useState$8(false);
  const [form, setForm] = useState$8({ title: "", description: "", goal: "", keywords: "", visibility: "PUBLIC" });
  const [errors, setErrors] = useState$8({});
  useEffect$9(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    topicService.getTopics({}).then((res) => setTopics(res.data.filter((t) => t.createdById === teacherId))).catch(() => {
    }).finally(() => setLoading(false));
  }, [teacherId]);
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Сэдвийн нэр заавал оруулна уу";
    if (!form.description.trim()) e.description = "Тайлбар заавал оруулна уу";
    if (!form.goal.trim()) e.goal = "Судалгааны зорилго заавал оруулна уу";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const resetForm = () => {
    setForm({ title: "", description: "", goal: "", keywords: "", visibility: "PUBLIC" });
    setErrors({});
    setShowForm(false);
  };
  const handleCreate = () => {
    if (!validate()) return;
    setSubmitting(true);
    topicService.createTopic({
      title: form.title,
      description: form.description,
      researchGoal: form.goal,
      keywords: form.keywords || void 0,
      createdById: teacherId,
      visibility: form.visibility,
      status: "ACTIVE"
    }).then((res) => {
      setTopics((prev) => [res.data, ...prev]);
      resetForm();
    }).catch(() => {
    }).finally(() => setSubmitting(false));
  };
  const handleSubmitForDeptReview = (topicId) => {
    topicService.submitTopicForDeptReview(topicId, teacherId).then((res) => setTopics((prev) => prev.map((t) => t.id === topicId ? res.data : t))).catch(() => {
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-ink-900 tracking-tight", children: "Миний сэдвүүд" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-0.5", children: "Оюутнуудад санал болгох сэдвүүдийг үүсгэж, удирдана уу." })
      ] }),
      !showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowForm(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
        " Шинэ сэдэв үүсгэх"
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-ink-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2 text-ink-900 tracking-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-4 h-4 text-ink-500", strokeWidth: 1.6 }),
          " Шинэ сэдэв үүсгэх"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: resetForm, className: "p-1 text-ink-400 hover:text-ink-900 rounded-md hover:bg-surface-muted", "aria-label": "Хаах", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4", strokeWidth: 1.6 }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Сэдвийн нэр", required: true, error: errors.title, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.title,
            onChange: (e) => setForm({ ...form, title: e.target.value }),
            placeholder: "Жишээ: Монгол хэлний NLP систем...",
            className: errors.title ? "border-[var(--color-dot-negative)]" : ""
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Сэдвийн тайлбар", required: true, error: errors.description, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: form.description,
            onChange: (e) => setForm({ ...form, description: e.target.value }),
            placeholder: "Сэдвийн тухай дэлгэрэнгүй тайлбар...",
            rows: 3,
            className: `resize-none ${errors.description ? "border-[var(--color-dot-negative)]" : ""}`
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Судалгааны зорилго", required: true, error: errors.goal, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.goal,
            onChange: (e) => setForm({ ...form, goal: e.target.value }),
            placeholder: "Энэхүү судалгаагаар ямар үр дүнд хүрэх вэ?",
            className: errors.goal ? "border-[var(--color-dot-negative)]" : ""
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Түлхүүр үгс", hint: "(таслалаар)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4", strokeWidth: 1.6 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.keywords,
              onChange: (e) => setForm({ ...form, keywords: e.target.value }),
              placeholder: "NLP, Machine Learning, AI...",
              className: "pl-9"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Харагдах байдал", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: form.visibility,
            onChange: (e) => setForm({ ...form, visibility: e.target.value }),
            className: "w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink-900 bg-surface",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PUBLIC", children: "Нийтэд нээлттэй" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PRIVATE", children: "Зөвхөн урилгаар" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: resetForm, disabled: submitting, children: "Цуцлах" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              className: "flex-1",
              onClick: handleCreate,
              disabled: submitting,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
                submitting ? "Үүсгэж байна..." : "Сэдэв үүсгэх"
              ]
            }
          )
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-ink-400 text-sm", children: "Ачааллаж байна..." }) : topics.length === 0 && !showForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 bg-surface rounded-md border border-dashed border-border-strong", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-10 h-10 text-ink-200 mx-auto mb-4", strokeWidth: 1.4 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-700", children: "Сэдэв байхгүй байна" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-400 mt-1", children: "Оюутнуудад санал болгох сэдэв үүсгэнэ үү." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-5", onClick: () => setShowForm(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
        " Сэдэв үүсгэх"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: topics.map((t) => {
      const s = statusMap$1[t.status] || { label: t.status, tone: "neutral" };
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border border-border hover:border-accent transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-1.5 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$4[s.tone]}` }),
              s.label
            ] }),
            t.visibility === "PUBLIC" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500", children: "Нийтэд нээлттэй" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-ink-900 leading-tight tracking-tight", children: t.title }),
          t.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mt-1 line-clamp-2", children: t.description }),
          t.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-700 mt-2 bg-surface-muted border border-border rounded-md px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Шалтгаан:" }),
            " ",
            t.rejectionReason
          ] }),
          t.keywords && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: t.keywords.split(",").map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-surface-muted text-ink-600 border border-border rounded-sm px-1.5 py-0.5", children: k.trim() }, k)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-ink-400 whitespace-nowrap tabular-nums", children: t.createdAt ? t.createdAt.split("T")[0] : "" }),
          t.status === "DRAFT" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleSubmitForDeptReview(t.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
            " Тэнхимд илгээх"
          ] })
        ] })
      ] }) }) }, t.id);
    }) })
  ] });
}
function FormField({ label, required, hint, error, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block", children: [
      label,
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-dot-negative)] ml-1", children: "*" }),
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 normal-case tracking-normal text-ink-400 font-normal", children: hint })
    ] }),
    children,
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--color-dot-negative)] mt-1", children: error })
  ] });
}

const {useEffect: useEffect$8} = await importShared('react');
function Dialog({
  open,
  onClose,
  children,
  maxWidth = "max-w-md",
  scrollable = false,
  closeOnOverlayClick = true
}) {
  useEffect$8(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  useEffect$8(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { backgroundColor: "rgba(10,10,10,0.32)" },
      onClick: closeOnOverlayClick ? onClose : void 0,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `relative w-full ${maxWidth} bg-surface border border-border-strong rounded-md ${scrollable ? "max-h-[90vh] overflow-hidden flex flex-col" : ""}`,
          onClick: (e) => e.stopPropagation(),
          children
        }
      )
    }
  );
}
function DialogHeader({ title, icon, onClose }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border shrink-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
      icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-700 [&>svg]:w-4 [&>svg]:h-4", children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[15px] font-semibold text-ink-900 tracking-tight", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onClose,
        className: "text-ink-400 hover:text-ink-900 hover:bg-accent-softer rounded-md p-1.5 transition-colors",
        "aria-label": "Хаах",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
      }
    )
  ] });
}
function DialogBody({ children, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-6 py-5 ${className}`, children });
}
function DialogFooter({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 justify-end px-6 py-4 border-t border-border shrink-0", children });
}

const {useState: useState$7,useEffect: useEffect$7} = await importShared('react');
function TeacherTopicRequestsTab() {
  const [activeRequests, setActiveRequests] = useState$7([]);
  const [selectedRequest, setSelectedRequest] = useState$7(null);
  const [showConfirmModal, setShowConfirmModal] = useState$7(null);
  const [loading, setLoading] = useState$7(true);
  const [rejectionReason, setRejectionReason] = useState$7("");
  const [userMap, setUserMap] = useState$7({});
  const [topicMap, setTopicMap] = useState$7({});
  useEffect$7(() => {
    Promise.all([
      topicService.getTopicRequests({ status: "PENDING" }).catch(() => ({ data: [] })),
      userService.getStudents().catch(() => ({ data: [] })),
      topicService.getTopics().catch(() => ({ data: [] }))
    ]).then(([reqRes, userRes, topicRes]) => {
      setActiveRequests(reqRes.data || []);
      const map = {};
      (userRes.data || []).forEach((u) => {
        if (u.id) map[u.id] = u.displayName || u.name || u.id;
        if (u.username) map[u.username] = u.displayName || u.name || u.username;
      });
      setUserMap(map);
      const tmap = {};
      (topicRes.data || []).forEach((t) => {
        if (t.id != null) tmap[t.id] = t.title || `Сэдэв #${t.id}`;
      });
      setTopicMap(tmap);
    }).finally(() => setLoading(false));
  }, []);
  const studentName = (id) => resolveName(id, userMap, "Тодорхойгүй оюутан");
  const topicTitle = (id) => id != null && topicMap[id] || `Сэдэв #${id}`;
  const handleAction = () => {
    if (!selectedRequest || !showConfirmModal) return;
    if (showConfirmModal === "reject" && !rejectionReason.trim()) return;
    const user = getStoredUser();
    const teacherId = user?.userId || user?.username || "teacher";
    const action = showConfirmModal === "approve" ? topicService.approveRequest(selectedRequest.id, teacherId) : topicService.rejectRequest(selectedRequest.id, teacherId, rejectionReason.trim());
    action.then(() => {
      setActiveRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      setShowConfirmModal(null);
      setSelectedRequest(null);
      setRejectionReason("");
    }).catch(() => {
      setShowConfirmModal(null);
      setSelectedRequest(null);
      setRejectionReason("");
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-1 border border-border h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2 text-ink-900 tracking-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-4 h-4 text-ink-500", strokeWidth: 1.6 }),
          "Ирсэн хүсэлтүүд",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-ink-500 tabular-nums", children: activeRequests.length })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center p-6 text-ink-400 text-sm", children: "Ачааллаж байна..." }) : activeRequests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center p-6 text-ink-500 text-sm", children: "Шинэ хүсэлт байхгүй байна." }) : activeRequests.map((r) => {
          const active = selectedRequest?.id === r.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSelectedRequest(r),
              className: `w-full text-left p-3 rounded-md transition-colors border ${active ? "bg-accent-soft border-accent" : "hover:bg-surface-muted border-transparent"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: initialsFromName(studentName(r.requestedById)) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 truncate tracking-tight", children: studentName(r.requestedById) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate mt-0.5", children: topicTitle(r.topicId) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 flex justify-between items-center text-[11px] text-ink-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3", strokeWidth: 1.6 }),
                    " ",
                    r.requestedAt?.split("T")[0] || "Огноогүй"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-wider", children: r.status })
                ] })
              ]
            },
            r.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: !selectedRequest ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-dashed border-border-strong h-96 flex flex-col items-center justify-center bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-10 h-10 text-ink-200 mb-4", strokeWidth: 1.4 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-ink-500 text-sm", children: "Зүүн талаас хүсэлт сонгож дэлгэрэнгүй мэдээллийг харна уу." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border pb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-12 w-12 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: initialsFromName(studentName(selectedRequest.requestedById)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-ink-900 tracking-tight mb-0.5", children: studentName(selectedRequest.requestedById) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowConfirmModal("reject"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
              " Татгалзах"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowConfirmModal("approve"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
              " Батлах"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md p-5 bg-surface-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2", children: "Хүсэлт гаргасан сэдэв" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-base font-semibold text-ink-900 tracking-tight mb-2", children: topicTitle(selectedRequest.topicId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[var(--color-dot-warning)]" }),
              selectedRequest.status
            ] })
          ] }),
          selectedRequest.motivation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2", children: "Сэдвийг сонгох шалтгаан" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-700 leading-relaxed p-4 rounded-md border border-border bg-surface italic", children: [
              "“",
              selectedRequest.motivation,
              "”"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md p-3 border border-border bg-surface-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1", children: "Илгээсэн огноо" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tabular-nums", children: selectedRequest.requestedAt?.split("T")[0] || "Огноогүй" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md p-3 border border-border bg-surface-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1", children: "Статус" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900", children: selectedRequest.status })
            ] })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!showConfirmModal, onClose: () => {
      setShowConfirmModal(null);
      setRejectionReason("");
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DialogHeader,
        {
          title: showConfirmModal === "approve" ? "Хүсэлтийг батлах" : "Хүсэлтээс татгалзах",
          icon: showConfirmModal === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-ink-900", strokeWidth: 1.6 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-ink-900", strokeWidth: 1.6 }),
          onClose: () => {
            setShowConfirmModal(null);
            setRejectionReason("");
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogBody, { children: showConfirmModal === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-700 leading-relaxed", children: [
        "Та ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-ink-900", children: studentName(selectedRequest?.requestedById) }),
        "-ийн сонгосон хүсэлтийг батлахдаа итгэлтэй байна уу? Баталсны дараа оюутан таны удирдсан оюутнуудын жагсаалтад орно."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-700 leading-relaxed", children: [
          "Та ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-ink-900", children: studentName(selectedRequest?.requestedById) }),
          "-ийн хүсэлтээс татгалзах гэж байна."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5", children: [
            "Татгалзах шалтгаан ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-dot-negative)]", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              className: "w-full border border-border rounded-md px-3 py-2 text-sm text-ink-900 resize-none focus:outline-none focus:border-ink-900 bg-surface",
              rows: 3,
              placeholder: "Татгалзах шалтгааныг тайлбарлана уу...",
              value: rejectionReason,
              onChange: (e) => setRejectionReason(e.target.value)
            }
          ),
          rejectionReason.trim() === "" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mt-1", children: "Шалтгаан заавал бичих шаардлагатай." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowConfirmModal(null);
          setRejectionReason("");
        }, children: "Цуцлах" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleAction,
            disabled: showConfirmModal === "reject" && !rejectionReason.trim(),
            children: showConfirmModal === "approve" ? "Баталгаажуулах" : "Татгалзах"
          }
        )
      ] })
    ] })
  ] });
}

const {useState: useState$6,useEffect: useEffect$6} = await importShared('react');
function TeacherStudentProposalsTab() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  const [proposals, setProposals] = useState$6([]);
  const [selectedProp, setSelectedProp] = useState$6(null);
  const [showConfirmModal, setShowConfirmModal] = useState$6(null);
  const [rejectionReason, setRejectionReason] = useState$6("");
  const [submitting, setSubmitting] = useState$6(false);
  const [errMsg, setErrMsg] = useState$6(null);
  const [loading, setLoading] = useState$6(true);
  const [userMap, setUserMap] = useState$6({});
  useEffect$6(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    Promise.all([
      topicService.getStudentProposals(teacherId).catch(() => ({ data: [] })),
      userService.getStudents().catch(() => ({ data: [] }))
    ]).then(([res, usersRes]) => {
      setProposals(res.data.filter((p) => p.status === "PENDING_TEACHER_APPROVAL"));
      const map = {};
      (usersRes.data || []).forEach((u) => {
        if (u.id) map[u.id] = u.displayName || u.name || u.id;
        if (u.username) map[u.username] = u.displayName || u.name || u.username;
      });
      setUserMap(map);
    }).finally(() => setLoading(false));
  }, [teacherId]);
  const studentName = (id) => resolveName(id, userMap, "Тодорхойгүй оюутан");
  const closeModal = () => {
    setShowConfirmModal(null);
    setRejectionReason("");
    setErrMsg(null);
  };
  const handleAction = () => {
    if (!selectedProp || !showConfirmModal) return;
    setSubmitting(true);
    setErrMsg(null);
    const promise = showConfirmModal === "approve" ? topicService.submitTopicForDeptReview(selectedProp.id, teacherId) : topicService.rejectProposal(selectedProp.id, teacherId, rejectionReason.trim() || "Багш татгалзсан");
    promise.then(() => {
      setProposals((prev) => prev.filter((p) => p.id !== selectedProp.id));
      setSelectedProp(null);
      closeModal();
    }).catch((err) => {
      const msg = err?.response?.data?.error || err?.message || "Үйлдэл амжилтгүй боллоо.";
      setErrMsg(msg);
    }).finally(() => setSubmitting(false));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-1 border border-border h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2 text-ink-900 tracking-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-4 h-4 text-ink-500", strokeWidth: 1.6 }),
          "Оюутны дэвшүүлсэн сэдэв",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-ink-500 tabular-nums", children: proposals.length })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center p-6 text-ink-400 text-sm", children: "Ачааллаж байна..." }) : proposals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center p-6 text-ink-500 text-sm", children: "Одоогоор хүлээгдэж буй сэдэв алга байна." }) : proposals.map((p) => {
          const active = selectedProp?.id === p.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSelectedProp(p),
              className: `w-full text-left p-3 rounded-md transition-colors border ${active ? "bg-accent-soft border-accent" : "hover:bg-surface-muted border-transparent"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: initialsFromName(studentName(p.createdById)) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium truncate tracking-tight ${active ? "text-ink-900" : "text-ink-900"}`, children: studentName(p.createdById) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate mt-0.5", children: p.title })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 flex justify-between items-center text-[11px] text-ink-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3", strokeWidth: 1.6 }),
                    " ",
                    p.createdAt?.split("T")[0] || "Огноогүй"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider", children: p.status })
                ] })
              ]
            },
            p.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: !selectedProp ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-dashed border-border-strong h-96 flex flex-col items-center justify-center bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-10 h-10 text-ink-200 mb-4", strokeWidth: 1.4 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-ink-500 text-sm", children: "Зүүн талаас сэдвийг сонгоно уу." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border pb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-12 w-12 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: initialsFromName(studentName(selectedProp.createdById)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-ink-900 tracking-tight mb-0.5", children: studentName(selectedProp.createdById) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500", children: selectedProp.title })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            (selectedProp.status === "PENDING_TEACHER_APPROVAL" || selectedProp.status === "DRAFT") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowConfirmModal("reject"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
                " Татгалзах"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowConfirmModal("approve"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 mr-2", strokeWidth: 1.6 }),
                " Батлах"
              ] })
            ] }),
            (selectedProp.status === "DEPT_PENDING" || selectedProp.status === "PENDING_DEPT_APPROVAL") && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface-muted text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[var(--color-dot-warning)]" }),
              "Тэнхим батлах хүлээгдэж байна"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md p-5 bg-surface-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2", children: "Сэдвийн нэр" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-ink-900 tracking-tight mb-2", children: selectedProp.title }),
            selectedProp.keywords && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap mt-3", children: selectedProp.keywords.split(",").map((kw) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] px-2 py-0.5 bg-surface text-ink-700 rounded-sm border border-border", children: kw.trim() }, kw)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2", children: "Судалгааны зорилго" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700 leading-relaxed p-4 rounded-md border border-border bg-surface", children: selectedProp.researchGoal || "Тодорхойлоогүй" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2", children: "Сэдвийн дэлгэрэнгүй тайлбар" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700 leading-relaxed p-4 rounded-md border border-border bg-surface", children: selectedProp.description })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!showConfirmModal, onClose: closeModal, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DialogHeader,
        {
          title: showConfirmModal === "approve" ? "Сэдвийг батлах" : "Сэдвээс татгалзах",
          icon: showConfirmModal === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-ink-900", strokeWidth: 1.6 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-ink-900", strokeWidth: 1.6 }),
          onClose: closeModal
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogBody, { children: [
        showConfirmModal === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-700 leading-relaxed", children: [
          "Та ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-ink-900", children: studentName(selectedProp?.createdById) }),
          "-ийн дэвшүүлсэн сэдвийг батлахдаа итгэлтэй байна уу? Сэдэв тэнхимийн батлалтад шилжих болно."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-700 leading-relaxed", children: [
            "Та ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-ink-900", children: studentName(selectedProp?.createdById) }),
            "-ийн сэдвээс татгалзах гэж байна."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5", children: [
              "Татгалзах шалтгаан ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-dot-negative)]", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                className: "w-full border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-ink-900 bg-surface",
                rows: 3,
                placeholder: "Шалтгаанаа товч бичнэ үү...",
                value: rejectionReason,
                onChange: (e) => setRejectionReason(e.target.value)
              }
            )
          ] })
        ] }),
        errMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--color-dot-negative)] mt-3 inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" }),
          errMsg
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeModal, disabled: submitting, children: "Цуцлах" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleAction,
            disabled: submitting || showConfirmModal === "reject" && !rejectionReason.trim(),
            children: submitting ? "Боловсруулж байна..." : showConfirmModal === "approve" ? "Батлах" : "Татгалзах"
          }
        )
      ] })
    ] })
  ] });
}

const {useState: useState$5,useEffect: useEffect$5} = await importShared('react');
const toneDot$3 = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]"};
const PLAN_STATUS_LABEL = {
  SUBMITTED: "Илгээсэн",
  REVISION_REQUIRED: "Засвар шаардлагатай",
  APPROVED: "Батлагдсан",
  DRAFT: "Ноорог"
};
function TeacherPlanReviewTab() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  const [plans, setPlans] = useState$5([]);
  const [loadingPlans, setLoadingPlans] = useState$5(true);
  const [selectedPlan, setSelectedPlan] = useState$5(null);
  const [planWeeks, setPlanWeeks] = useState$5([]);
  const [loadingWeeks, setLoadingWeeks] = useState$5(false);
  const [expandedWeeks, setExpandedWeeks] = useState$5(/* @__PURE__ */ new Set());
  const [showConfirmModal, setShowConfirmModal] = useState$5(null);
  const [rejectionReason, setRejectionReason] = useState$5("");
  const [submitting, setSubmitting] = useState$5(false);
  const [userMap, setUserMap] = useState$5({});
  useEffect$5(() => {
    planService.getPlans({ supervisorId: teacherId, status: "SUBMITTED" }).then((res) => setPlans(res.data)).catch(() => {
    }).finally(() => setLoadingPlans(false));
    userService.getStudents().then((res) => {
      const map = {};
      (res.data || []).forEach((u) => {
        if (u.id) map[u.id] = u.displayName || u.name || u.id;
        if (u.username) map[u.username] = u.displayName || u.name || u.username;
      });
      setUserMap(map);
    }).catch(() => {
    });
  }, [teacherId]);
  const studentName = (id) => resolveName(id, userMap, "Тодорхойгүй оюутан");
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanWeeks([]);
    setExpandedWeeks(/* @__PURE__ */ new Set());
    setLoadingWeeks(true);
    planService.getPlanWeeks(plan.id).then((res) => setPlanWeeks(res.data)).catch(() => {
    }).finally(() => setLoadingWeeks(false));
  };
  const toggleWeek = (id) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const handleReview = () => {
    if (!selectedPlan || !showConfirmModal) return;
    if (showConfirmModal === "reject" && !rejectionReason.trim()) return;
    setSubmitting(true);
    const decision = showConfirmModal === "approve" ? "APPROVED" : "REVISION_REQUIRED";
    planService.reviewPlan(selectedPlan.id, {
      reviewedBy: teacherId,
      decision,
      comment: rejectionReason.trim() || void 0
    }).then(() => {
      setPlans((prev) => prev.filter((p) => p.id !== selectedPlan.id));
      setSelectedPlan(null);
      setPlanWeeks([]);
      setShowConfirmModal(null);
      setRejectionReason("");
    }).catch(() => {
    }).finally(() => setSubmitting(false));
  };
  const resetModal = () => {
    setShowConfirmModal(null);
    setRejectionReason("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-1 border border-border h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2 text-ink-900 tracking-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-ink-500", strokeWidth: 1.6 }),
          " Хянах хүлээгдэж буй"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: loadingPlans ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center p-4 text-ink-400 text-sm", children: "Ачааллаж байна..." }) : plans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-6 text-ink-400 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-8 h-8 mx-auto mb-2 text-ink-200", strokeWidth: 1.4 }),
          "Бүх төлөвлөгөө хянагдсан байна."
        ] }) : plans.map((p) => {
          const active = selectedPlan?.id === p.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleSelectPlan(p),
              className: `w-full text-left p-3 rounded-md transition-colors border ${active ? "bg-accent-soft border-accent" : "hover:bg-surface-muted border-transparent"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-8 w-8 border border-border-strong shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-[10px] font-medium", children: initialsFromName(studentName(p.studentId)) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 truncate tracking-tight", children: studentName(p.studentId) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate", children: p.title || `Төлөвлөгөө #${p.id}` })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex justify-between items-center text-[11px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-ink-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$3.warning}` }),
                    PLAN_STATUS_LABEL[p.status] || p.status
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-400 tabular-nums", children: p.submittedAt?.split("T")[0] || "Огноогүй" })
                ] })
              ]
            },
            p.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: !selectedPlan ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-dashed border-border-strong h-96 flex flex-col items-center justify-center bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-10 h-10 text-ink-200 mb-3", strokeWidth: 1.4 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-ink-500 text-sm", children: "Зүүн талаас оюутан сонгоно уу." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border pb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-ink-900 tracking-tight", children: studentName(selectedPlan.studentId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-600 mt-0.5", children: selectedPlan.title || `Төлөвлөгөө #${selectedPlan.id}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-ink-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5", strokeWidth: 1.6 }),
                "Илгээсэн: ",
                selectedPlan.submittedAt?.split("T")[0] || "Огноогүй"
              ] }),
              (selectedPlan.revisionCount ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-ink-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$3.warning}` }),
                "Засварын тоо: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: selectedPlan.revisionCount })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowConfirmModal("reject"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 mr-1.5", strokeWidth: 1.6 }),
              " Засварт буцаах"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowConfirmModal("approve"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 mr-1.5", strokeWidth: 1.6 }),
              " Батлах"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5 text-ink-500", strokeWidth: 1.6 }),
            "Долоо хоногийн төлөвлөгөө",
            planWeeks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-ink-400 normal-case tracking-normal tabular-nums", children: [
              "(",
              planWeeks.length,
              " долоо хоног)"
            ] })
          ] }),
          loadingWeeks ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-400 py-4 text-center", children: "Ачааллаж байна..." }) : planWeeks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-ink-400 text-sm bg-surface-muted rounded-md border border-border", children: "Долоо хоногийн төлөвлөгөө оруулаагүй байна." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: planWeeks.sort((a, b) => a.weekNumber - b.weekNumber).map((week) => {
            const isOpen = expandedWeeks.has(week.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => toggleWeek(week.id),
                  className: "w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-muted transition-colors text-left",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-7 h-7 rounded-md border border-border-strong bg-surface-muted text-ink-900 text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums", children: week.weekNumber }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-ink-900 tracking-tight", children: [
                        week.weekNumber,
                        "-р долоо хоног"
                      ] }),
                      week.completionRate != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-ink-500 tabular-nums", children: [
                        week.completionRate,
                        "%"
                      ] })
                    ] }),
                    isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-ink-400", strokeWidth: 1.6 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-ink-400", strokeWidth: 1.6 })
                  ]
                }
              ),
              isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 space-y-3 border-t border-border bg-surface-muted", children: [
                week.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1", children: "Тайлбар" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700", children: week.description })
                ] }),
                week.plannedTasks && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1", children: "Төлөвлөсөн ажлууд" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700 whitespace-pre-line", children: week.plannedTasks })
                ] }),
                week.completedTasks && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$3.positive}` }),
                    "Гүйцэтгэсэн ажлууд"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-700 whitespace-pre-line", children: week.completedTasks })
                ] })
              ] })
            ] }, week.id);
          }) })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!showConfirmModal, onClose: resetModal, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DialogHeader,
        {
          title: showConfirmModal === "approve" ? "Төлөвлөгөө батлах" : "Засварт буцаах",
          icon: showConfirmModal === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-ink-900", strokeWidth: 1.6 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-ink-900", strokeWidth: 1.6 }),
          onClose: resetModal
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogBody, { children: showConfirmModal === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-700 leading-relaxed", children: [
        "Та ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-ink-900", children: studentName(selectedPlan?.studentId) }),
        "-ийн төлөвлөгөөг батлах гэж байна. Баталсны дараа оюутан дипломын ажлаа эхлэх боломжтой болно."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-ink-700 leading-relaxed", children: [
          "Та ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-ink-900", children: studentName(selectedPlan?.studentId) }),
          "-ийн төлөвлөгөөг засварт буцаах гэж байна."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5", children: [
            "Засварт буцаах шалтгаан ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-dot-negative)]", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              className: "w-full border border-border rounded-md px-3 py-2 text-sm text-ink-900 resize-none focus:outline-none focus:border-ink-900 bg-surface",
              rows: 3,
              placeholder: "Засварт буцаах шалтгаан, зөвлөмжөө бичнэ үү...",
              value: rejectionReason,
              onChange: (e) => setRejectionReason(e.target.value)
            }
          ),
          !rejectionReason.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mt-1", children: "Шалтгаан заавал бичих шаардлагатай." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: resetModal, children: "Цуцлах" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: submitting || showConfirmModal === "reject" && !rejectionReason.trim(),
            onClick: handleReview,
            children: submitting ? "Боловсруулж байна..." : showConfirmModal === "approve" ? "Батлах" : "Засварт буцаах"
          }
        )
      ] })
    ] })
  ] });
}

const {useState: useState$4,useEffect: useEffect$4} = await importShared('react');
function TeacherThesis() {
  const [activeTab, setActiveTab] = useState$4("topics");
  const [counts, setCounts] = useState$4({ topics: 0, requests: 0, proposals: 0, plans: 0 });
  useEffect$4(() => {
    const user = getStoredUser();
    const teacherId = user?.userId || user?.username || "";
    if (!teacherId) return;
    Promise.all([
      topicService.getTopics().catch(() => ({ data: [] })),
      topicService.getTopicRequests({ status: "PENDING" }).catch(() => ({ data: [] })),
      topicService.getStudentProposals(teacherId).catch(() => ({ data: [] })),
      planService.getPlans({ supervisorId: teacherId, status: "SUBMITTED" }).catch(() => ({ data: [] }))
    ]).then(([tr, rr, pr, plr]) => {
      const myTopics = (tr.data || []).filter((t) => t.createdById === teacherId);
      const myProposals = (pr.data || []).filter((p) => p.status === "PENDING_TEACHER_APPROVAL");
      setCounts({
        topics: myTopics.length,
        requests: (rr.data || []).length,
        proposals: myProposals.length,
        plans: (plr.data || []).length
      });
    });
  }, []);
  const pendingTotal = counts.requests + counts.proposals + counts.plans;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-7xl mx-auto pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full bg-accent transition-all duration-700",
          style: { width: `${counts.topics > 0 ? 100 : 30}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${pendingTotal > 0 ? "bg-[var(--color-dot-warning)]" : "bg-[var(--color-dot-positive)]"}` }),
              pendingTotal > 0 ? `${pendingTotal} ажил хүлээгдэж байна` : "Хүлээгдэж буй ажил алга"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1", children: "Сэдэв ба төлөвлөгөө" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-ink-900 tracking-tight leading-tight", children: "Дипломын сэдэв удирдлага" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1", children: "Сэдвээ үүсгэх, оюутнуудын хүсэлт хүлээн авах, төлөвлөгөө хянах үйлдлүүдийг доороос гүйцэтгэнэ." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 border border-border rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold text-ink-900 tabular-nums tracking-tight", children: counts.topics }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1", children: "Сэдэв" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "topics", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          "Миний сэдвүүд",
          counts.topics > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-surface-muted text-ink-700 border border-border tabular-nums", children: counts.topics })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "requests", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          "Сэдвийн хүсэлтүүд",
          counts.requests > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums", children: counts.requests })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "proposals", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          "Оюутны дэвшүүлсэн",
          counts.proposals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums", children: counts.proposals })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "plans", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          "Төлөвлөгөө хянах",
          counts.plans > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums", children: counts.plans })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "topics", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherTopicManagementTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "requests", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherTopicRequestsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "proposals", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherStudentProposalsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "plans", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherPlanReviewTab, {}) })
    ] })
  ] });
}

const fromV2 = (m, fallbackThesisId) => ({
  id: m.id,
  thesisId: m.conversationId ?? fallbackThesisId,
  senderId: m.senderId,
  senderType: "",
  // sender role no longer in payload — set by caller if needed
  content: m.content,
  sentAt: m.createdAt,
  read: m.status === "SEEN",
  conversationId: m.conversationId,
  receiverId: m.receiverId,
  status: m.status,
  seenAt: m.seenAt
});
const warn = (msg) => console.warn(`[chatService v2-adapter] ${msg}`);
const chatService = {
  getMessages: (thesisId) => messageApi.get(`/api/messages/${thesisId}`).then((r) => ({ data: r.data.map((m) => fromV2(m, thesisId)) })).catch(() => ({ data: [] })),
  /**
   * Send a message in a conversation.
   *
   * `receiverId` is required by v2. Callers that omit it trigger a warning
   * and the backend will reject with 400.
   */
  sendMessage: (thesisId, senderId, senderRole, content, receiverId) => {
    if (!receiverId) {
      warn(`sendMessage to thesis ${thesisId} missing receiverId — v2 message_service will reject this. Update caller to pass the counterpart user id (senderRole=${senderRole}).`);
    }
    return messageApi.post("/api/messages", {
      conversationId: thesisId,
      senderId,
      receiverId: receiverId ?? "",
      content
    }).then((r) => ({ data: fromV2(r.data, thesisId) }));
  },
  markRead: (thesisId, readerId) => messageApi.post(`/api/messages/${thesisId}/seen`, null, { params: { userId: readerId } })
};

const {useState: useState$3,useEffect: useEffect$3,useRef} = await importShared('react');
function TeacherMessages() {
  const [plans, setPlans] = useState$3([]);
  const [selectedPlan, setSelectedPlan] = useState$3(null);
  const [messages, setMessages] = useState$3([]);
  const [messageText, setMessageText] = useState$3("");
  const [searchQuery, setSearchQuery] = useState$3("");
  const [sending, setSending] = useState$3(false);
  const [userMap, setUserMap] = useState$3({});
  const bottomRef = useRef(null);
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  const teacherName = user?.username || "Багш";
  useEffect$3(() => {
    Promise.all([
      planService.getPlans({ supervisorId: teacherId }).catch(() => ({ data: [] })),
      userService.getStudents().catch(() => ({ data: [] }))
    ]).then(([planRes, studentsRes]) => {
      setPlans(planRes.data || []);
      const map = {};
      (studentsRes.data || []).forEach((s) => {
        if (s.id) map[s.id] = s.displayName || s.name || s.id;
        if (s.studentId) map[s.studentId] = s.displayName || s.name || s.id;
      });
      setUserMap(map);
    });
  }, [teacherId]);
  const studentLabel = (sid) => resolveName(sid, userMap, "Оюутан");
  const planStatusLabel = {
    DRAFT: "Ноорог",
    SUBMITTED: "Илгээсэн",
    REVISION_REQUIRED: "Засвар шаардлагатай",
    APPROVED: "Багш баталсан",
    DEPT_APPROVED: "Тэнхим баталсан"
  };
  const statusLabel = (s) => s && planStatusLabel[s] || s || "";
  useEffect$3(() => {
    const thesisId = selectedPlan?.thesisId ?? selectedPlan?.studentId;
    if (!thesisId) {
      setMessages([]);
      return;
    }
    const load = () => {
      chatService.getMessages(thesisId).then((res) => {
        setMessages(res.data);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }).catch(() => {
      });
    };
    load();
    const interval = setInterval(load, 1e4);
    return () => clearInterval(interval);
  }, [selectedPlan]);
  const handleSendMessage = () => {
    const thesisId = selectedPlan?.thesisId ?? selectedPlan?.studentId;
    if (!messageText.trim() || !thesisId) return;
    setSending(true);
    chatService.sendMessage(thesisId, teacherId, "TEACHER", messageText.trim()).then((res) => {
      setMessages((prev) => [...prev, res.data]);
      setMessageText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }).catch(() => {
    }).finally(() => setSending(false));
  };
  const filteredPlans = plans.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.studentId.toLowerCase().includes(q) || studentLabel(p.studentId).toLowerCase().includes(q);
  });
  const isTeacherMessage = (msg) => msg.senderType === "TEACHER" || msg.senderId === teacherId;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[calc(100vh-200px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4 border-r border-border flex flex-col h-full bg-surface", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400 h-4 w-4", strokeWidth: 1.6 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Оюутан хайх...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-10"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: filteredPlans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-ink-400 text-sm mt-4", children: "Оюутан олдсонгүй" }) : filteredPlans.map((plan) => {
        const active = selectedPlan?.id === plan.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedPlan(plan),
            className: `w-full px-4 py-3 border-b border-border text-left transition-colors ${active ? "bg-accent-soft border-l-2 border-l-accent" : "hover:bg-surface-muted border-l-2 border-l-transparent"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: initialsFromName(studentLabel(plan.studentId)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 truncate tracking-tight", children: studentLabel(plan.studentId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate", children: statusLabel(plan.status) })
              ] })
            ] })
          },
          plan.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-8 flex flex-col h-full", children: !selectedPlan ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center bg-surface-sunken", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-ink-400 text-sm", children: "Зүүн талаас оюутан сонгоно уу" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: initialsFromName(studentLabel(selectedPlan.studentId)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight", children: studentLabel(selectedPlan.studentId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500", children: statusLabel(selectedPlan.status) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Дэлгэрэнгүй", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4", strokeWidth: 1.6 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-4 bg-surface-sunken", children: [
        messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-ink-500 pt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Харилцаа алга байна" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 text-ink-400", children: "Оюутантайгаа харилцаагаа эхлүүлнэ үү." })
        ] }) : messages.map((msg) => {
          const mine = isTeacherMessage(msg);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${mine ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 max-w-[70%]", children: [
            !mine && /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-7 w-7 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-[10px] font-medium", children: initialsFromName(studentLabel(msg.senderId)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-md px-3 py-2 ${mine ? "bg-ink-900 text-white" : "bg-surface text-ink-900 border border-border"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: msg.content }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[10px] mt-1 text-ink-400 tabular-nums ${mine ? "text-right" : ""}`, children: msg.sentAt?.split("T")[1]?.substring(0, 5) || "" })
            ] }),
            mine && /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-7 w-7 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-[10px] font-medium", children: initialsFromName(teacherName) }) })
          ] }) }, msg.id);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "flex-shrink-0", "aria-label": "Файл хавсаргах", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4", strokeWidth: 1.6 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Мессежээ бичнэ үү...",
              value: messageText,
              onChange: (e) => setMessageText(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(),
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-shrink-0", disabled: sending || !messageText.trim(), onClick: handleSendMessage, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2", strokeWidth: 1.6 }),
            "Илгээх"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-400 mt-2", children: "Enter — илгээх, Shift+Enter — шинэ мөр" })
      ] })
    ] }) })
  ] }) }) }) });
}

const {useState: useState$2,useEffect: useEffect$2} = await importShared('react');
const toneDot$2 = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]"
};
const stageLabel$1 = (status) => {
  const map = {
    DRAFT: "Ноорог",
    PENDING_TEACHER_APPROVAL: "Багш хянаж байна",
    DEPT_PENDING: "Тэнхим хянаж байна",
    APPROVED: "Батлагдсан",
    ACTIVE: "Гүйцэтгэлд",
    SUBMITTED: "Тайлан илгаасэн",
    REVISION_REQUIRED: "Засвар шаардлагатай"
  };
  return map[status] || status;
};
const progressFromStatus = (status) => {
  const map = {
    DRAFT: 5,
    PENDING_TEACHER_APPROVAL: 15,
    DEPT_PENDING: 25,
    APPROVED: 40,
    ACTIVE: 60,
    SUBMITTED: 80,
    REVISION_REQUIRED: 35
  };
  return map[status] ?? 20;
};
const statusMap = {
  SUBMITTED: { label: "Тайлан илгаасэн", tone: "warning" },
  ACTIVE: { label: "Гүйцэтгэлд", tone: "neutral" },
  REVISION_REQUIRED: { label: "Засвар шаардлагатай", tone: "negative" },
  APPROVED: { label: "Батлагдсан", tone: "positive" },
  DEPT_PENDING: { label: "Тэнхим хянаж байна", tone: "warning" },
  PENDING_TEACHER_APPROVAL: { label: "Хянагдаж байна", tone: "warning" },
  DRAFT: { label: "Ноорог", tone: "neutral" }
};
function TeacherProgress() {
  const [students, setStudents] = useState$2([]);
  const [loading, setLoading] = useState$2(true);
  const [search, setSearch] = useState$2("");
  const [statusFilter, setStatusFilter] = useState$2("Бүгд");
  const [sortKey, setSortKey] = useState$2("name");
  const [sortDir, setSortDir] = useState$2("asc");
  const [selectedStudent, setSelectedStudent] = useState$2(null);
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  useEffect$2(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const [plansRes, usersRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          userService.getStudents()
        ]);
        const plans = plansRes.data;
        const users = usersRes.data;
        const userMap = {};
        users.forEach((u) => {
          if (u.username) userMap[u.username] = u.displayName;
          userMap[u.id] = u.displayName;
        });
        setStudents(plans.map((p) => ({
          id: p.studentId,
          name: resolveName(p.studentId, userMap, "Тодорхойгүй оюутан"),
          thesis: p.title || "Гарчиггүй",
          stage: stageLabel$1(p.status),
          status: p.status,
          progress: progressFromStatus(p.status),
          submittedAt: p.submittedAt,
          revisionCount: p.revisionCount || 0
        })));
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  const statusFilters = ["Бүгд", ...Object.keys(statusMap).filter((k) => students.some((s) => s.status === k))];
  const filtered = students.filter((s) => statusFilter === "Бүгд" || s.status === statusFilter).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.thesis.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    const valA = typeof a[sortKey] === "string" ? a[sortKey].toLowerCase() : a[sortKey];
    const valB = typeof b[sortKey] === "string" ? b[sortKey].toLowerCase() : b[sortKey];
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  const SortIcon = ({ col }) => sortKey === col ? sortDir === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3 h-3", strokeWidth: 1.6 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3 h-3", strokeWidth: 1.6 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "w-3 h-3 opacity-40", strokeWidth: 1.6 });
  const submitted = students.filter((s) => s.status === "SUBMITTED");
  const revisions = students.filter((s) => s.status === "REVISION_REQUIRED");
  const avgProgress = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-7xl mx-auto pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-accent transition-all duration-700", style: { width: `${avgProgress}%` } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${submitted.length > 0 ? toneDot$2.warning : toneDot$2.positive}` }),
              submitted.length > 0 ? "Тайлан хянах хүлээгдэж байна" : "Бүх тайлан хянагдсан"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1 tabular-nums", children: [
              students.length,
              " оюутан"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-ink-900 tracking-tight leading-tight", children: "Явцын хяналт" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1", children: "Хянаж буй оюутнуудын явц, шатны байдлыг доороос харна уу." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 border border-border rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-semibold text-ink-900 tabular-nums tracking-tight", children: [
            avgProgress,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1", children: "Дундаж" })
        ] })
      ] }) })
    ] }),
    (submitted.length > 0 || revisions.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      submitted.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$2.warning}` }),
          "Хянах шаардлагатай (",
          submitted.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: submitted.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border border-border rounded-md px-3 py-2 bg-surface-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-ink-900", children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-600", children: s.stage })
        ] }, s.id)) })
      ] }) }),
      revisions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$2.negative}` }),
          "Засвар шаардлагатай (",
          revisions.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: revisions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border border-border rounded-md px-3 py-2 bg-surface-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-ink-900", children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-ink-600 tabular-nums", children: [
            s.revisionCount,
            "x засвар"
          ] })
        ] }, s.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400", strokeWidth: 1.6 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Оюутан эсвэл дипломын ажлаар хайх...",
              className: "pl-9 pr-4 py-2 border border-border rounded-md text-sm w-full focus:outline-none focus:border-ink-900 bg-surface",
              value: search,
              onChange: (e) => setSearch(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            className: "border border-border rounded-md text-sm px-3 py-2 bg-surface focus:outline-none focus:border-ink-900",
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            children: statusFilters.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s === "Бүгд" ? "Бүгд" : statusMap[s]?.label || s }, s))
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-ink-400 text-sm", children: "Ачааллаж байна..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center text-ink-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "w-8 h-8 mx-auto mb-3 text-ink-200", strokeWidth: 1.4 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: students.length === 0 ? "Хянаж буй оюутан байхгүй байна." : "Шүүлтэд тохирох оюутан олдсонгүй." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[700px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-surface-muted border-b border-border", children: [
          { label: "Оюутан", key: "name" },
          { label: "Шат", key: "stage" },
          { label: "Засвар", key: null },
          { label: "Дэвшил", key: "progress" },
          { label: "Байдал", key: null },
          { label: "", key: null }
        ].map(({ label, key }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-5 py-3", children: key ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSort(key), className: "flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium text-ink-500 hover:text-ink-900 transition-colors", children: [
          label,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { col: key })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500", children: label }) }, i)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: filtered.map((s) => {
          const cfg = statusMap[s.status] || { label: s.status, tone: "neutral" };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface-muted transition-colors group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-8 w-8 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: s.name.substring(0, 2).toUpperCase() }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tracking-tight", children: s.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 line-clamp-1 max-w-[180px]", children: s.thesis })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-700", children: s.stage }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs tabular-nums ${s.revisionCount > 0 ? "text-ink-900 font-medium" : "text-ink-500"}`, children: s.revisionCount > 0 ? `${s.revisionCount}x засвар` : "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 min-w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 flex-1 bg-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-accent transition-all", style: { width: `${s.progress}%` } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-ink-700 w-8 text-right tabular-nums", children: [
                s.progress,
                "%"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$2[cfg.tone]}` }),
              cfg.label
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "text-xs opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => setSelectedStudent(s), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5 mr-1", strokeWidth: 1.6 }),
              " Дэлгэрэнгүй"
            ] }) })
          ] }, s.id);
        }) })
      ] }) })
    ] }),
    selectedStudent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-ink-900/30 z-50 flex justify-end", onClick: () => setSelectedStudent(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-surface h-full shadow-xl overflow-y-auto border-l border-border", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-border flex justify-between items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-ink-900 tracking-tight", children: selectedStudent.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1", children: selectedStudent.thesis })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedStudent(null), className: "p-1.5 hover:bg-surface-muted rounded-md shrink-0", "aria-label": "Хаах", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-ink-500", strokeWidth: 1.6 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [
          { label: "Шат", value: selectedStudent.stage },
          { label: "Байдал", value: statusMap[selectedStudent.status]?.label || selectedStudent.status },
          { label: "Засварын тоо", value: selectedStudent.revisionCount > 0 ? `${selectedStudent.revisionCount}x` : "—" },
          { label: "Илгээсэн", value: selectedStudent.submittedAt ? selectedStudent.submittedAt.split("T")[0] : "—" }
        ].map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md p-3 border border-border bg-surface-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tabular-nums", children: value })
        ] }, label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2", children: "Нийт дэвшил" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 flex-1 bg-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-accent transition-all", style: { width: `${selectedStudent.progress}%` } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-semibold text-ink-900 tabular-nums", children: [
              selectedStudent.progress,
              "%"
            ] })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}

const {useState: useState$1,useEffect: useEffect$1} = await importShared('react');
const toneDot$1 = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]"};
const stageLabel = (stageType) => {
  const map = {
    PROGRESS_1: "Явц 1-ийн хяналт",
    PROGRESS_2: "Явц 2-ын хяналт",
    PRE_DEFENSE: "Урьдчилсан хамгаалалт",
    FINAL_DEFENSE: "Эцсийн хамгаалалт"
  };
  return map[stageType] || stageType;
};
function TeacherCommittee() {
  const [activeTab, setActiveTab] = useState$1("students");
  const [myCommittees, setMyCommittees] = useState$1([]);
  const [defenseSessions, setDefenseSessions] = useState$1([]);
  const [loading, setLoading] = useState$1(true);
  const navigate = useNavigate();
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  useEffect$1(() => {
    const load = async () => {
      try {
        const assignmentsRes = await committeeService.getMyAssignments(teacherId);
        const assignments = assignmentsRes.data;
        const committeeIds = [...new Set(assignments.map((a) => a.committeeId))];
        const committees = await Promise.all(
          committeeIds.map((id) => committeeService.getById(id).then((r) => r.data).catch(() => null))
        );
        const withRole = committees.filter((c) => c !== null).map((c) => ({
          ...c,
          role: assignments.find((a) => a.committeeId === c.id)?.role || "MEMBER"
        }));
        setMyCommittees(withRole);
        if (committeeIds.length > 0) {
          const sessionsRes = await workflowService.getDefenseSessions({ committeeId: committeeIds[0] }).catch(() => ({ data: [] }));
          setDefenseSessions(sessionsRes.data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);
  const pending = myCommittees.filter((c) => c.status === "ACTIVE" || c.status === "Идэвхтэй");
  const completed = myCommittees.filter((c) => c.status !== "ACTIVE" && c.status !== "Идэвхтэй");
  const completionRatio = pending.length + completed.length > 0 ? Math.round(completed.length / (pending.length + completed.length) * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-7xl mx-auto pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-accent transition-all duration-700", style: { width: `${completionRatio}%` } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${pending.length > 0 ? toneDot$1.warning : toneDot$1.positive}` }),
              pending.length > 0 ? `${pending.length} идэвхтэй комисс` : "Бүх комисс дууссан"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1 tabular-nums", children: [
              pending.length + completed.length,
              " нийт"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-ink-900 tracking-tight leading-tight", children: "Комиссын ажил" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1", children: "Комиссийн гишүүнээр хуваарилагдсан үнэлгээг удирдана уу." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 border border-border rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-semibold text-ink-900 tabular-nums tracking-tight", children: [
            completionRatio,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1", children: "Дууссан" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "w-full", children: [
        { value: "students", label: "Хуваарилагдсан комиссууд" },
        { value: "schedule", label: "Хуваарь" },
        { value: "completed", label: "Дууссан үнэлгээнүүд" }
      ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TabsTrigger,
        {
          value: tab.value,
          children: tab.label
        },
        tab.value
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "students", className: "mt-6 space-y-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-ink-400 text-sm", children: "Ачааллаж байна..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500", children: "Идэвхтэй комиссууд" }),
        pending.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-ink-400 text-sm bg-surface-muted rounded-md border border-border", children: "Идэвхтэй комисс байхгүй байна." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: pending.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border border-border hover:border-accent transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: c.name.substring(0, 2).toUpperCase() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight truncate", children: c.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 whitespace-nowrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$1.warning}` }),
                  "Идэвхтэй"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 mt-0.5", children: c.stageType ? stageLabel(c.stageType) : "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-surface-muted p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 block mb-1", children: "Үүрэг" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-ink-900", children: c.role })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-surface-muted p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider font-medium text-ink-500 block mb-1", children: "Статус" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-ink-900", children: c.status })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "w-full",
              onClick: (e) => {
                e.stopPropagation();
                navigate(`/teacher/students?committeeId=${c.id}&stageType=${c.stageType || ""}`);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3.5 h-3.5 mr-1.5", strokeWidth: 1.6 }),
                " Үнэлэх"
              ]
            }
          )
        ] }) }, c.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 pt-4", children: "Дууссан комиссууд" }),
        completed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-4 text-ink-400 text-sm", children: "Дууссан комисс байхгүй." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: completed.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex items-center justify-between hover:bg-surface-muted transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: c.name.substring(0, 2).toUpperCase() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tracking-tight", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500", children: c.stageType ? stageLabel(c.stageType) : "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-600", children: c.role }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$1.positive}` }),
              "Дууссан"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-ink-300", strokeWidth: 1.6 })
          ] })
        ] }, c.id)) }) }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "schedule", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "border-b border-border pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2 text-ink-900 tracking-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-ink-500", strokeWidth: 1.6 }),
          " Комиссийн хуваарь"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-ink-400 text-sm", children: "Ачааллаж байна..." }) : defenseSessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-ink-400 text-sm", children: "Хуваарилагдсан хамгаалалт байхгүй байна." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: defenseSessions.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-12 h-12 rounded-md border border-border-strong bg-surface-muted flex flex-col items-center justify-center shrink-0 tabular-nums", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-medium text-ink-500 leading-none", children: [
                session.startedAt?.split("T")[0]?.split("-")[1] || "—",
                "/"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold text-ink-900 leading-none mt-0.5", children: session.startedAt?.split("T")[0]?.split("-")[2] || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-ink-900 tracking-tight", children: stageLabel(session.stageType) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-ink-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 tabular-nums", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3", strokeWidth: 1.6 }),
                  session.startedAt?.split("T")[1]?.substring(0, 5) || "—"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Статус: ",
                  session.status
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => window.open(`/api/defense-sessions/${session.id}`, "_blank"), children: "Дэлгэрэнгүй харах" })
        ] }, session.id)) }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "completed", className: "mt-6 space-y-4", children: completed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-ink-400 text-sm bg-surface-muted border border-border rounded-md", children: "Дууссан үнэлгээ байхгүй байна." }) : completed.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-sm font-medium", children: c.name.substring(0, 2).toUpperCase() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-500", children: [
                c.role,
                " · ",
                c.stageType ? stageLabel(c.stageType) : "—"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot$1.positive}` }),
            "Дууссан"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2", children: "Тайлбарын түүх" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-400 italic", children: "Тайлбар бичигдээгүй байна." })
        ] })
      ] }) }, c.id)) })
    ] })
  ] });
}

const {useState,useEffect} = await importShared('react');
const toneDot = {
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]"
};
const GRADING_SCHEMES = {
  PRE_DEFENSE: {
    label: "Урьдчилсан хамгаалалтын үнэлгээ",
    total: 25,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 }
    ]
  },
  FINAL_DEFENSE: {
    label: "Эцсийн хамгаалалтын үнэлгээ",
    total: 40,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 },
      { name: "Шүүмж (Reviewer)", max: 5 },
      { name: "Нэмэлт үнэлгээ", max: 10 }
    ]
  }
};
function ExternalExpertGrading() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingStudent, setGradingStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [comment, setComment] = useState("");
  const [gradeStatus, setGradeStatus] = useState("idle");
  const [gradeError, setGradeError] = useState(null);
  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const [assignRes, usersRes] = await Promise.all([
          committeeService.getMyAssignments(teacherId),
          userService.getStudents()
        ]);
        const expertAssignments = assignRes.data.filter((a) => a.role === "EXTERNAL_EXPERT");
        if (expertAssignments.length === 0) {
          setLoading(false);
          return;
        }
        const userMap = {};
        usersRes.data.forEach((u) => {
          userMap[u.id] = u.displayName;
          if (u.username) userMap[u.username] = u.displayName;
        });
        const allPlansRes = await planService.getPlans().catch(() => ({ data: [] }));
        const planMap = {};
        allPlansRes.data.forEach((p) => {
          planMap[p.studentId] = { title: p.title, thesisId: p.thesisId };
        });
        const items = [];
        await Promise.all(expertAssignments.map(async (assignment) => {
          try {
            const [committeeRes, studentsRes] = await Promise.all([
              committeeService.getById(assignment.committeeId),
              committeeService.getStudents(assignment.committeeId)
            ]);
            const committee = committeeRes.data;
            const stageType = committee.stageType || "";
            const sessionsRes = await workflowService.getDefenseSessions({ stageType }).catch(() => ({ data: [] }));
            const openSessions = sessionsRes.data.filter((s) => s.status === "OPEN" || s.status === "ACTIVE" || s.status === "CLOSED");
            const session = openSessions.find((s) => s.committeeId === assignment.committeeId) || openSessions.find((s) => s.stageType === stageType) || null;
            const students = studentsRes.data.map((cs) => ({
              studentId: cs.studentId,
              name: resolveName(cs.studentId, userMap, "Тодорхойгүй оюутан"),
              thesisTitle: planMap[cs.studentId]?.title || "Гарчиггүй",
              thesisId: planMap[cs.studentId]?.thesisId
            }));
            const myGrades = {};
            if (session) {
              const gradesRes = await evaluationService.getDefenseGrades({
                defenseSessionId: session.id,
                evaluatorId: teacherId
              });
              gradesRes.data.forEach((g) => {
                myGrades[g.studentId] = g;
              });
            }
            items.push({ committeeId: assignment.committeeId, committeeName: committee.name, stageType, session, students, myGrades });
          } catch {
          }
        }));
        setCommittees(items);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);
  const openGrading = (committeeId, studentId, existing) => {
    setGradingStudent({ committeeId, studentId });
    setScores({});
    setComment(existing?.comment || "");
    setGradeStatus("idle");
    setGradeError(null);
  };
  const getSchemeFor = (stageType) => {
    const base = GRADING_SCHEMES[stageType];
    if (!base) return null;
    if (stageType !== "FINAL_DEFENSE") return base;
    const criteria = base.criteria.filter((c) => !c.name.startsWith("Шүүмж"));
    const total = criteria.reduce((sum, c) => sum + c.max, 0);
    return { ...base, criteria, total };
  };
  const handleSubmit = async (cmt, student) => {
    if (!cmt.session) return;
    const scheme = getSchemeFor(cmt.stageType);
    if (!scheme) return;
    const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
    setGradeStatus("loading");
    setGradeError(null);
    try {
      const res = await evaluationService.saveGrade({
        defenseSessionId: cmt.session.id,
        thesisId: student.thesisId || "",
        studentId: student.studentId,
        evaluatorId: teacherId,
        evaluatorRole: "EXTERNAL_EXPERT",
        points: total,
        maxPoints: scheme.total,
        comment
      });
      await evaluationService.submitGrade(res.data.id);
      setCommittees((prev) => prev.map(
        (c) => c.committeeId !== cmt.committeeId ? c : {
          ...c,
          myGrades: { ...c.myGrades, [student.studentId]: { ...res.data, isSubmitted: true } }
        }
      ));
      setGradeStatus("success");
      setTimeout(() => {
        setGradingStudent(null);
        setScores({});
        setComment("");
        setGradeStatus("idle");
      }, 1500);
    } catch (err) {
      setGradeError(err?.response?.data?.message || "Үнэлгээ илгээхэд алдаа гарлаа.");
      setGradeStatus("error");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-48 text-ink-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin w-6 h-6 border-2 border-ink-900 border-t-transparent rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Ачааллаж байна..." })
    ] }) });
  }
  if (committees.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-72 text-ink-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-10 h-10 text-ink-200 mb-4", strokeWidth: 1.4 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-ink-700", children: "Гадаад эксперт үнэлгээ байхгүй" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1 text-ink-400", children: "Танд хуваарилагдсан комиссийн үнэлгээ олдсонгүй." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-4xl mx-auto pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-ink-900 tracking-tight", children: "Гадаад эксперт үнэлгээ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink-500 mt-1", children: "Томилогдсон комиссын оюутнуудад үнэлгээ өгнө үү." })
    ] }),
    committees.map((cmt) => {
      const scheme = getSchemeFor(cmt.stageType);
      const sessionOpen = cmt.session?.status === "OPEN" || cmt.session?.status === "ACTIVE";
      const sessionClosed = cmt.session?.status === "CLOSED";
      const stageLabel = cmt.stageType === "PRE_DEFENSE" ? "Урьдчилсан хамгаалалт" : "Эцсийн хамгаалалт";
      const gradedCount = cmt.students.filter((s) => cmt.myGrades[s.studentId]?.isSubmitted).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base text-ink-900 tracking-tight mb-1.5", children: cmt.committeeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap text-xs text-ink-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-700", children: stageLabel }),
              cmt.session?.scheduledDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3", strokeWidth: 1.6 }),
                new Date(cmt.session.scheduledDate).toLocaleString("mn-MN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
              ] }),
              cmt.session?.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3", strokeWidth: 1.6 }),
                cmt.session.location
              ] }),
              sessionOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-ink-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot.warning}` }),
                "Явцад байна"
              ] }),
              sessionClosed && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-ink-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot.neutral}` }),
                "Дууссан"
              ] }),
              !cmt.session && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink-400", children: "Хуваарь тогтоогдоогүй" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-ink-500 flex items-center gap-1 justify-end tabular-nums", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5", strokeWidth: 1.6 }),
              " ",
              cmt.students.length,
              " оюутан"
            ] }),
            cmt.students.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-ink-900 mt-0.5 tabular-nums", children: [
              gradedCount,
              "/",
              cmt.students.length,
              " үнэлсэн"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
          !cmt.session && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-ink-400 text-sm", children: "Хамгаалалтын сесс эхлээгүй байна." }),
          cmt.session && cmt.students.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-ink-400 text-sm", children: "Комисст оюутан байхгүй байна." }),
          cmt.session && cmt.students.map((student) => {
            const existing = cmt.myGrades[student.studentId];
            const isGrading = gradingStudent?.committeeId === cmt.committeeId && gradingStudent?.studentId === student.studentId;
            const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border last:border-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "p-4 flex items-center justify-between hover:bg-surface-muted transition-colors cursor-pointer select-none",
                  onClick: () => {
                    if (sessionClosed) return;
                    if (isGrading) {
                      setGradingStudent(null);
                      return;
                    }
                    openGrading(cmt.committeeId, student.studentId, existing);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 shrink-0 border border-border-strong", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs font-medium", children: student.name.substring(0, 2).toUpperCase() }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-ink-900 tracking-tight", children: student.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-ink-500 truncate max-w-[280px]", children: student.thesisTitle })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 shrink-0 ml-3", children: existing?.isSubmitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-ink-700 tabular-nums", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 text-[var(--color-dot-positive)]", strokeWidth: 1.6 }),
                      existing.points,
                      "/",
                      scheme?.total
                    ] }) : sessionClosed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ink-400", children: "Дууссан" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-ink-600", children: [
                      isGrading ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3 h-3", strokeWidth: 1.6 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3 h-3", strokeWidth: 1.6 }),
                      existing ? "Засах" : "Үнэлэх"
                    ] }) })
                  ]
                }
              ),
              isGrading && scheme && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-5 pt-4 bg-surface-muted border-t border-border space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-ink-900 tracking-tight", children: scheme.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: scheme.criteria.map((c, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-ink-700 flex-1", children: c.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: c.max,
                      value: scores[idx] ?? "",
                      onChange: (e) => {
                        const v = Math.min(c.max, Math.max(0, Number(e.target.value)));
                        setScores((prev) => ({ ...prev, [idx]: v }));
                      },
                      className: "w-16 border border-border rounded-md px-2 py-1.5 text-sm text-center bg-surface focus:outline-none focus:border-ink-900 tabular-nums"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-ink-400 w-10 tabular-nums", children: [
                    "/ ",
                    c.max
                  ] })
                ] }, idx)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider font-medium text-ink-500", children: "Нийт оноо" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-lg font-semibold tabular-nums ${totalScore > scheme.total ? "text-[var(--color-dot-negative)]" : "text-ink-900"}`, children: [
                    totalScore,
                    " / ",
                    scheme.total
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    placeholder: "Тайлбар (заавал биш)...",
                    className: "w-full border border-border rounded-md px-3 py-2 text-sm resize-none bg-surface focus:outline-none focus:border-ink-900",
                    rows: 2,
                    value: comment,
                    onChange: (e) => setComment(e.target.value)
                  }
                ),
                gradeError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--color-dot-negative)] flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${toneDot.negative}` }),
                  gradeError
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setGradingStudent(null), children: "Болих" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      className: "flex-1",
                      disabled: gradeStatus === "loading" || totalScore === 0 || totalScore > scheme.total,
                      onClick: () => handleSubmit(cmt, student),
                      children: gradeStatus === "loading" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 justify-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" }),
                        "Хадгалж байна..."
                      ] }) : gradeStatus === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 justify-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4", strokeWidth: 1.6 }),
                        " Амжилттай"
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 justify-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4", strokeWidth: 1.6 }),
                        " Үнэлгээ илгээх"
                      ] })
                    }
                  )
                ] })
              ] })
            ] }, student.studentId);
          })
        ] })
      ] }, cmt.committeeId);
    })
  ] });
}

const features = [
  { label: "Progress Monitoring", desc: "Track all students' stages and deadlines in real-time." },
  { label: "Committee Dashboard", desc: "Unified rubric scoring, averages, and committee results." },
  { label: "Final Evaluation Flow", desc: "Weighted final scores, defense notes, and signed submissions." }
];
function ComingSoon() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[75vh] text-center px-6 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 bg-blue-50 border border-slate-200 rounded-3xl flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Construction, { className: "w-12 h-12 text-[#1455BD]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-2 -right-2 w-7 h-7 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-orange-500" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-extrabold text-slate-900 mb-2 tracking-tight", children: "Тун удахгүй" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block bg-blue-50 border border-blue-100 text-[#1455BD] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5", children: "In Active Development" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 text-sm max-w-md mb-10 leading-relaxed", children: "Энэ хэсэг одоо идэвхтэй боловсруулагдаж байна. Гүйцэтгэлийн чанарын хамт тун удахгүй гарна." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-10", children: features.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-200 hover:shadow-sm transition-all group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-[#1455BD]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-900 mb-1", children: f.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 leading-snug", children: f.desc })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate(-1),
          className: "flex items-center gap-2 px-5 py-2.5 bg-[#1455BD] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Буцах"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4 text-slate-400" }),
        "Мэдэгдэл авах"
      ] })
    ] })
  ] });
}

function App({ user }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HashRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Route, { path: "/teacher", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherLayout, { user }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { index: true, element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherDashboard, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "students", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherStudents, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "thesis", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherThesis, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "messages", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherMessages, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "reports", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherThesis, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "evaluations", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherCommittee, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "feedback", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherMessages, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "progress", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherProgress, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "committee", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherCommittee, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "scores", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherProgress, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "expert", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalExpertGrading, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "settings", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ComingSoon, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "*", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/teacher", replace: true }) })
  ] }) });
}

const React = await importShared('react');
const container = document.getElementById("microfrontend-root");
if (container) {
  const user = guardRoute("teacher");
  if (user) {
    container.innerHTML = "";
    const root = clientExports.createRoot(container);
    root.render(
      /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, { user }) })
    );
  }
} else {
  console.error("[module-teacher] #microfrontend-root элемент олдсонгүй");
}
