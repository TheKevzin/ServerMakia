import zlib from 'zlib';

export function parseNbt(buffer: Buffer): any {
  let buf = buffer;
  if (buf[0] === 0x1f && buf[1] === 0x8b) {
    buf = zlib.gunzipSync(buf);
  }

  let offset = 0;

  function readTag(tagType: number): any {
    switch (tagType) {
      case 1: { // Byte
        const val = buf.readInt8(offset);
        offset += 1;
        return val;
      }
      case 2: { // Short
        const val = buf.readInt16BE(offset);
        offset += 2;
        return val;
      }
      case 3: { // Int
        const val = buf.readInt32BE(offset);
        offset += 4;
        return val;
      }
      case 4: { // Long
        const val = buf.readBigInt64BE(offset);
        offset += 8;
        return Number(val);
      }
      case 5: { // Float
        const val = buf.readFloatBE(offset);
        offset += 4;
        return val;
      }
      case 6: { // Double
        const val = buf.readDoubleBE(offset);
        offset += 8;
        return val;
      }
      case 7: { // Byte Array
        const len = buf.readInt32BE(offset);
        offset += 4;
        const slice = buf.subarray(offset, offset + len);
        offset += len;
        return slice;
      }
      case 8: { // String
        const len = buf.readUInt16BE(offset);
        offset += 2;
        const str = buf.toString('utf8', offset, offset + len);
        offset += len;
        return str;
      }
      case 9: { // List
        const elemType = buf.readInt8(offset);
        offset += 1;
        const len = buf.readInt32BE(offset);
        offset += 4;
        const list: any[] = [];
        for (let i = 0; i < len; i++) {
          list.push(readTag(elemType));
        }
        return list;
      }
      case 10: { // Compound
        const compound: Record<string, any> = {};
        while (offset < buf.length) {
          const type = buf.readInt8(offset);
          offset += 1;
          if (type === 0) break; // TAG_End
          const nameLen = buf.readUInt16BE(offset);
          offset += 2;
          const name = buf.toString('utf8', offset, offset + nameLen);
          offset += nameLen;
          compound[name] = readTag(type);
        }
        return compound;
      }
      case 11: { // Int Array
        const len = buf.readInt32BE(offset);
        offset += 4;
        const arr: number[] = [];
        for (let i = 0; i < len; i++) {
          arr.push(buf.readInt32BE(offset));
          offset += 4;
        }
        return arr;
      }
      case 12: { // Long Array
        const len = buf.readInt32BE(offset);
        offset += 4;
        const arr: number[] = [];
        for (let i = 0; i < len; i++) {
          arr.push(Number(buf.readBigInt64BE(offset)));
          offset += 8;
        }
        return arr;
      }
      default:
        return null;
    }
  }

  const rootType = buf.readInt8(offset);
  offset += 1;
  const rootNameLen = buf.readUInt16BE(offset);
  offset += 2 + rootNameLen;
  return readTag(rootType);
}
