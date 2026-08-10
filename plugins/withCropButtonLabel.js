const { withStringsXml, AndroidConfig } = require('@expo/config-plugins');

/**
 * expo-image-picker's allowsEditing crop screen (Android) comes from the
 * bundled android-image-cropper library, whose "CROP" action bar button
 * text is hardcoded as the `crop_image_menu_crop` string resource. There's
 * no JS-level option to relabel it, but Android lets an app override a
 * library's resource by declaring one with the same name — so this adds
 * that override at prebuild time.
 */
function withCropButtonLabel(config, { label = 'Save' } = {}) {
  return withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'crop_image_menu_crop', translatable: 'false' }, _: label }],
      config.modResults
    );
    return config;
  });
}

module.exports = withCropButtonLabel;
