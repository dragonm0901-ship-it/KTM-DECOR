"use client";

import React from "react";
import {
  ArrowLeft as SolarArrowLeft,
  ArrowRight as SolarArrowRight,
  ArrowRightUp as SolarArrowUpRight,
  AltArrowLeft as SolarAltArrowLeft,
  AltArrowRight as SolarAltArrowRight,
  CheckCircle as SolarCheckCircle,
  Star as SolarStar,
  TrashBinMinimalistic as SolarTrashBinMinimalistic,
  AddSquare as SolarAddSquare,
  MinusSquare as SolarMinusSquare,
  ChatRoundLine as SolarChatRoundLine,
  ChatRoundUnread as SolarChatRoundUnread,
  SendSquare as SolarSendSquare,
  SquareShareLine as SolarSquareShareLine,
  CloseCircle as SolarCloseCircle,
  Moon as SolarMoon,
  Sun as SolarSun,
  TransferHorizontal as SolarTransferHorizontal,
  Box as SolarBox,
  Pen as SolarPen,
  Sledgehammer as SolarSledgehammer,
  Delivery as SolarDelivery,
  MapPoint as SolarMapPoint,
  InfoCircle as SolarInfoCircle,
  Upload as SolarUpload,
  Stars as SolarStars,
  Text as SolarText,
  Settings as SolarSettings,
  Palette as SolarPalette,
  Widget as SolarWidget,
  Maximize as SolarMaximize,
  Ruler as SolarRuler,
  DangerCircle as SolarDangerCircle,
  Gallery as SolarGallery,
  Magnifer as SolarMagnifer,
  Tuning as SolarTuning,
  Filter as SolarFilter,
  DoubleAltArrowLeft as SolarDoubleAltArrowLeft,
  Bag3 as SolarBag3,
  Chart2 as SolarChart2,
  FileText as SolarFileText
} from "@solar-icons/react";

export interface IconProps extends React.ComponentPropsWithoutRef<"svg"> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

const createIcon = (SolarComponent: React.ComponentType<any>) => {
  const WrappedIcon = ({ size = 24, strokeWidth, ...props }: IconProps) => {
    return <SolarComponent size={size} weight="Linear" {...props} />;
  };
  WrappedIcon.displayName = SolarComponent.displayName || "SolarIcon";
  return WrappedIcon;
};

export const ArrowLeft = createIcon(SolarArrowLeft);
export const ArrowRight = createIcon(SolarArrowRight);
export const ArrowUpRight = createIcon(SolarArrowUpRight);
export const Check = createIcon(SolarCheckCircle);
export const Star = createIcon(SolarStar);
export const Trash2 = createIcon(SolarTrashBinMinimalistic);
export const Plus = createIcon(SolarAddSquare);
export const Minus = createIcon(SolarMinusSquare);
export const MessageCircle = createIcon(SolarChatRoundLine);
export const MessageSquare = createIcon(SolarChatRoundUnread);
export const Send = createIcon(SolarSendSquare);
export const ExternalLink = createIcon(SolarSquareShareLine);
export const X = createIcon(SolarCloseCircle);
export const Moon = createIcon(SolarMoon);
export const Sun = createIcon(SolarSun);
export const MoveHorizontal = createIcon(SolarTransferHorizontal);
export const Package = createIcon(SolarBox);
export const PenTool = createIcon(SolarPen);
export const Wrench = createIcon(SolarSledgehammer);
export const Truck = createIcon(SolarDelivery);
export const MapPin = createIcon(SolarMapPoint);
export const Info = createIcon(SolarInfoCircle);
export const Upload = createIcon(SolarUpload);
export const Sparkles = createIcon(SolarStars);
export const Type = createIcon(SolarText);
export const Sliders = createIcon(SolarSettings);
export const Palette = createIcon(SolarPalette);
export const Layout = createIcon(SolarWidget);
export const Maximize2 = createIcon(SolarMaximize);
export const Ruler = createIcon(SolarRuler);
export const AlertCircle = createIcon(SolarDangerCircle);
export const Image = createIcon(SolarGallery);
export const Search = createIcon(SolarMagnifer);
export const SlidersHorizontal = createIcon(SolarTuning);
export const Filter = createIcon(SolarFilter);
export const Quote = createIcon(SolarDoubleAltArrowLeft);
export const ShoppingBag = createIcon(SolarBag3);
export const TrendingUp = createIcon(SolarChart2);
export const FileImage = createIcon(SolarFileText);
export const ChevronLeft = createIcon(SolarAltArrowLeft);
export const ChevronRight = createIcon(SolarAltArrowRight);
export const Settings = createIcon(SolarSettings);
