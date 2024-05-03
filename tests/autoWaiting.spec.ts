import {test, expect} from '@playwright/test'
import { timeout } from 'rxjs/operators';

test.beforeEach(async({page}, testInfo) => {
  await page.goto('http://uitestingplayground.com/ajax');
  await page.getByText('Button Triggering AJAX Request').click();
  testInfo.setTimeout(testInfo.timeout + 2000); //will be applied to every test in this spec
})

test('auto waiting', async({page}) => {
  const successButton = page.locator('.bg-success');

  // click is waiting for button to appear for 30 sec
  // await successButton.click();

  // textContent is waiting for text to appear for 30 sec
  // const text = await successButton.textContent();
  // expect(text).toEqual('Data loaded with AJAX get request.');

  // allTextContent does not wait for text to be displayed
  // const text1 = await successButton.allTextContents();
  // // additional wait for the method to be sure that element is attached before method is executed
  // await successButton.waitFor({state: "attached"});
  // expect(text1).toContain('Data loaded with AJAX get request.');

  // default waiting time for assertion is 5 sec
  await expect(successButton).toHaveText('Data loaded with AJAX get request.', {timeout: 20000});
})

test('alternative waits', async({page}) => {
  const successButton = page.locator('.bg-success');

  // ___ wait for  element
  await page.waitForSelector('.bg-success');

  // ___ wait for particular response
  await page.waitForResponse('http://uitestingplayground.com/ajaxdata');

  // ___ wait for network calls to be completed ('NOT RECOMMENDED')
  // it will wait for all calls to be completed, even if they are not related to test
  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(5000);

  const text1 = await successButton.allTextContents();
  expect(text1).toContain('Data loaded with AJAX get request.');
})

test('timeouts', async({page}) => {
  test.setTimeout(10000);
  // test.slow() - will increase default timeout in 3 times
  const successButton = page.locator('.bg-success');
  await successButton.click({timeout: 16000});

})
