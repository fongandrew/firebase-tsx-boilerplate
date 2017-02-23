/*
  Roll-our-own type defintions for React Router v4 pending official release
*/

declare module "react-router-dom" {
  import {
    ComponentClass,
    ComponentElement,
    CSSProperties,
    HTMLProps,
    StatelessComponent
  } from "react";
  import { Action, History, Location, LocationDescriptor } from "history";

  export interface RouterProps {
    history?: History;
    children?: JSX.Element;
  }

  export interface BrowserRouterProps extends RouterProps {
    basename?: string;
    getUserConfirmation?: (
      message: string,
      callback: (result: boolean) => void
    ) => void;
    forceRefresh?: boolean;
    keyLength?: number;
  }

  export const BrowserRouter: ComponentClass<BrowserRouterProps>;

  export interface StaticRouterProps extends RouterProps {
    basename?: string;
    location?: LocationDescriptor;
    context?: { url?: string };
  }

  export const StaticRouter: ComponentClass<StaticRouterProps>;

  export interface HashRouterProps extends RouterProps {
    basename?: string;
    getUserConfirmation?: (
      message: string,
      callback: (result: boolean) => void
    ) => void;
    hashType?: "slash"|"noslash"|"hashbang";
  }

  export const HashRouter: ComponentClass<HashRouterProps>;

  export interface MemoryRouterProps extends RouterProps {
    initialEntries?: LocationDescriptor[];
    initialIndex?: number;
    getUserConfirmation?: (
      message: string,
      callback: (result: boolean) => void
    ) => void;
    keyLength?: number;
  }

  export const MemoryRouter: ComponentClass<MemoryRouterProps>;

  export interface Match {
    params: {[index: string]: string};
    isExact: boolean;
    path: string;
    url: string;
  }

  interface MatchOpts {
    exact?: boolean;
    strict?: boolean;
  }

  export function matchPath(
    path: string,
    pattern: string,
    opts?: MatchOpts
  ): Match;

  // What React Router sets context.router to
  export interface RouterContext extends History {
    match: Match;
  }

  interface RouteProps extends MatchOpts {
    path?: string;
    component?: ComponentClass<RouterContext>|StatelessComponent<RouterContext>;
    render?: (props: RouterContext) => JSX.Element;
    children?: (props: {
      match: Match|null,
      history: History
    }) => JSX.Element;
  }

  export const Route: ComponentClass<RouteProps>;

  export const Switch: ComponentClass<{
    children?: JSX.Element[];
  }>;

  export interface LinkProps extends HTMLProps<any> {
    to: LocationDescriptor;
    replace?: boolean;
  }

  export const Link: ComponentClass<LinkProps>;

  export interface NavLinkProps extends LinkProps, MatchOpts {
    activeClassName?: string;
    activeStyle?: CSSProperties;
    isActive?: (match: Match, location: Location) => boolean;
  }

  export interface RedirectProps {
    to: LocationDescriptor;
    push?: boolean;
  }

  export const Redirect: ComponentClass<RedirectProps>;

  export interface PromptProps {
    when?: boolean;
    message: string|((location: Location, action: Action) => string);
  }

  export const Prompt: ComponentClass<PromptProps>;

  export function withRouter<T>(
    c: ComponentClass<T & RouterContext>
  ): ComponentClass<T>;
}
