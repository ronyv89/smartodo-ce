describe('Landing Page', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the logo container', async () => {
    await expect(element(by.id('landing-logo-container'))).toBeVisible();
  });

  it('should display the Sign Up button', async () => {
    await expect(element(by.id('signup-button'))).toBeVisible();
  });

  it('should display the Log In button', async () => {
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should display the tagline text', async () => {
    await expect(element(by.text('Smart task management, simplified.'))).toBeVisible();
  });
});
