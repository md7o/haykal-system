import { Request } from 'express';
// ---------- DTOs ----------
export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  username: string;
  email: string;
  password: string;
}

// ---------- User Types ----------
export interface UserBase {
  userId: string;
  email: string;
  username: string;
  role: string;
}

// ---------- Auth Responses ----------
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface SignInResponse extends UserBase, AuthTokens {}

export interface SignUpResponse extends UserBase, AuthTokens {}

// ---------- Device Info ----------
export interface DeviceInfo {
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  device: string;
  type: string;
}

export interface RequestWithDevice extends Request {
  deviceInfo?: DeviceInfo;
}
