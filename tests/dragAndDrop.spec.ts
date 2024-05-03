import {test, expect} from '@playwright/test';

test('drag and drop with iframe', async({page}) =>{
  page.goto('https://www.globalsqa.com/demo-site/draganddrop/');

  const frame = page.frameLocator('[rel-title="Photo Manager"] iframe');
  await frame.locator('li', {hasText: "High Tatras 2"}).dragTo(frame.locator('#trash'));

  //more precise control
  await frame.locator('li', {hasText: "High Tatras 4"}).hover();
  //simmulates left click by mouse
  await page.mouse.down();
  await frame.locator('#trash').hover();
  //simmulates mouse release
  await page.mouse.up();

  await expect(frame.locator('#trash li h5')).toHaveText(["High Tatras 2", "High Tatras 4"]);
})
