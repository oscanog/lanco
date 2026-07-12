/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as certifications from "../certifications.js";
import type * as changePassword from "../changePassword.js";
import type * as copyTrade from "../copyTrade.js";
import type * as http from "../http.js";
import type * as myFunctions from "../myFunctions.js";
import type * as platformAddresses from "../platformAddresses.js";
import type * as recharges from "../recharges.js";
import type * as security from "../security.js";
import type * as settings from "../settings.js";
import type * as trade from "../trade.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";
import type * as withdrawals from "../withdrawals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  certifications: typeof certifications;
  changePassword: typeof changePassword;
  copyTrade: typeof copyTrade;
  http: typeof http;
  myFunctions: typeof myFunctions;
  platformAddresses: typeof platformAddresses;
  recharges: typeof recharges;
  security: typeof security;
  settings: typeof settings;
  trade: typeof trade;
  users: typeof users;
  wallets: typeof wallets;
  withdrawals: typeof withdrawals;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
