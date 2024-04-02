const ASSET_NAMES = [
  'playerRed.svg',
  'playerBlue.svg',
  'mageBlue.svg',
  'mageRed.svg',
  'rogueBlue.svg',
  'rogueRed.svg',
  'warriorBlue.svg',
  'warriorRed.svg',
  'bruteBlue.svg',
  'bruteRed.svg',
  'bullet.svg',
  'redProjectile.svg',
  'blueProjectile.svg',
  'blueHealingRing.svg',
  'redHealingRing.svg',
  'blueMagicWall.svg',
  'redMagicWall.svg',
  'rectangle.svg',
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
