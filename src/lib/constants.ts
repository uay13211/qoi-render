import {Threshold} from "./types";

//tags
export const RGB_TAG = 0xfe;
export const RGBA_TAG = 0xff;
export const INDEX_TAG = 0x00;
export const DIFF_TAG = 0x40;
export const LUMA_TAG = 0x80;
export const RUN_TAG = 0xc0;
export const END_MARK = [0, 0, 0, 0, 0, 0, 0, 1];
export const QOIF_MAGIC_BYTE = 0x716f6966;

// byte size
export const QOI_HEADER_SIZE = 14;
export const QOI_END_MARK_SIZE = END_MARK.length;

// bias
export const RUN_BIAS = -1;
export const DIFF_BIAS = 2;
export const LUMA_DG_BIAS = 32;
export const LUMA_DRDG_DBDG_BIAS = 8;

// threshold
export const RUN_THRESHOLD: Threshold = [0, 61];
export const DIFF_THRESHOLD: Threshold = [-2, 1];
export const LUMA_DG_THRESHOLD: Threshold = [-32, 31];
export const LUMA_DRDG_DBDG_THRESHOLD: Threshold = [-8, 7];

// chunk mask for extract require bit value
export const TAG_CHUNK_MASK = 0xc0;
export const RUN_LENGTH_CHUNK_MASK = 0x3f;
export const INDEX_CHUNK_MASK = 0x3f;
export const DIFF_DR_CHUNK_MASK = 0x30;
export const DIFF_DG_CHUNK_MASK = 0x0c;
export const DIFF_DB_CHUNK_MASK = 0x03;
export const LUMA_DG_CHUNK_MASK = 0x3f;
export const LUMA_DRDG_CHUNK_MASK = 0xf0;
export const LUMA_DBDG_CHUNK_MASK = 0x0f;
