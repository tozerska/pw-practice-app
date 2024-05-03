import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200/');
})

test.describe('Form Layouts page', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByText('Forms').click();
    await page.getByText('Form Layouts').click();
  })

  test('input field', async ({ page }) => {
    const usingTheGridEmailInput = page.locator('nb-card', { hasText: "Using the Grid" }).getByRole('textbox', { name: "Email" });

    await usingTheGridEmailInput.fill('test@test.com');
    await usingTheGridEmailInput.clear(); //can not be chained
    await usingTheGridEmailInput.pressSequentially('test2@test.com', { delay: 500 }); //keystrokes of keyboard, delay optional and can be customized

    //generic assertion
    const inputValue = await usingTheGridEmailInput.inputValue();
    expect(inputValue).toEqual('test2@test.com');

    //locator assertion
    await expect(usingTheGridEmailInput).toHaveValue('test2@test.com');
  })

  test('radio buttons', async ({ page }) => {
    const usingTheGridForm = page.locator('nb-card', { hasText: "Using the Grid" });

    //if visually hidden then check() won't work, that's why force true was added
    await usingTheGridForm.getByLabel('Option 1').check({ force: true });
    usingTheGridForm.getByRole('radio', { name: "Option 2" });

    //generic assertion
    //way to get radio button status
    const radioStatus = await usingTheGridForm.getByRole('radio', { name: "Option 1" }).isChecked();
    //check status is true
    expect(radioStatus).toBeTruthy();

    //locator assertion
    //checking status is true
    await expect(usingTheGridForm.getByRole('radio', { name: "Option 1" })).toBeChecked();

    await usingTheGridForm.getByLabel('Option 2').check({ force: true });
    expect(await usingTheGridForm.getByLabel('Option 1').isChecked()).toBeFalsy();
    expect(await usingTheGridForm.getByLabel('Option 2').isChecked()).toBeTruthy();
  })
})

test('checkboxes', async ({ page }) => {
  await page.getByText('Modal & Overlays').click();
  await page.getByText('Toastr').click();

  //check - will make a checkbox checked, even if it was already checked
  //click won't check status, it will uncheck if checked, and check if unchecked
  await page.getByRole('checkbox', { name: "Hide on click" }).uncheck({ force: true });
  await page.getByRole('checkbox', { name: "Hide on click" }).check({ force: true });

  const allBoxes = page.getByRole('checkbox'); //list of all checkboxes
  for (const box of await allBoxes.all()) { //.all( make an array)
    await box.check({ force: true }); //could be unchecked
    expect(await box.isChecked()).toBeTruthy(); //toBeFalsy() if unchecked
  }
})

test('lists and dropdowns', async ({ page }) => {
  const dropDownMenu = page.locator('ngx-header nb-select');
  await dropDownMenu.click();

  page.getByRole('list'); //when the list has UL tag
  page.getByRole('listitem'); //when the list has LI tag

  // const optionList = page.getByRole('list').locator('nb-option');
  const optionList = page.locator('nb-option-list nb-option'); //the same as above
  await expect(optionList).toHaveText(["Light", "Dark", "Cosmic", "Corporate"]);
  await optionList.filter({hasText: "Cosmic"}).click();
  const header = page.locator('nb-layout-header');
  await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)');

  const colors = {
    "Light": "rgb(255, 255, 255)",
    "Dark": "rgb(34, 43, 69)",
    "Cosmic": "rgb(50, 50, 89)",
    "Corporate": "rgb(255, 255, 255)"
  }

  await dropDownMenu.click();
  for(const color in colors){
    await optionList.filter({hasText: color}).click();
    await expect(header).toHaveCSS('background-color', colors[color]);
    if(color != "Corporate")
      await dropDownMenu.click();
  }
})

test('tooltips', async({page}) => {
  //goto Sources, click on: windows Ctrl + Shift + C - IOS back and slash
  await page.getByText('Modal & Overlays').click();
  await page.getByText('Tooltip').click();

  const toolTipCard = page.locator('nb-card', {hasText: "Tooltip Placements"});
  await toolTipCard.getByRole('button', {name: "Top"}).hover();

  page.getByRole('tooltip'); //if role tolltip is set
  const toolTip = await page.locator('nb-tooltip').textContent();
  expect(toolTip).toEqual('This is a tooltip');
})

test('dialog box', async({page}) => {
  await page.getByText('Tables & Data').click();
  await page.getByText('Smart Table').click();

  page.on('dialog', dialog => {
    expect(dialog.message()).toEqual('Are you sure you want to delete?');
    dialog.accept();
  });

  await page.getByRole('table').locator('tr', {hasText: "mdo@gmail.com"}).locator('.nb-trash').click();
  await expect(page.locator('table tr').first()).not.toHaveText('mdo@gmail.com');
})

test('web tables', async({page}) => {
  await page.getByText('Tables & Data').click();
  await page.getByText('Smart Table').click();

  //1 get the row by any test in this row
  const targetRow = page.getByRole('row', {name: "twitter@outlook.com"});
  await targetRow.locator('.nb-edit').click();
  await page.locator('input-editor').getByPlaceholder('Age').clear();
  await page.locator('input-editor').getByPlaceholder('Age').fill('35');
  await page.locator('.nb-checkmark').click();

  //2 get the row based on teh value in the specific column
  await page.locator('.ng2-smart-pagination-nav').getByText('2').click();
  const targetRowById = page.getByRole('row', {name: "11"}).filter({has: page.locator('td').nth(1).getByText('11')});
  targetRowById.locator('.nb-edit').click();
  await page.locator('input-editor').getByPlaceholder('E-mail').clear();
  await page.locator('input-editor').getByPlaceholder('E-mail').fill('test@test.com');
  await page.locator('.nb-checkmark').click();
  await expect(targetRowById.locator('td').nth(5)).toHaveText('test@test.com');

  //3 test filter of the table
  const ages = ["20", "30", "40", "200"];

  for(let age of ages){
    await page.locator('input-filter').getByPlaceholder('Age').clear();
    await page.locator('input-filter').getByPlaceholder('Age').fill(age);
    await page.waitForTimeout(500);
    const ageRows = page.locator('tbody tr');

    for(let row of await ageRows.all()){
      const cellValue = await row.locator('td').last().textContent();

      if(age == "200"){
        expect(await page.getByRole('table').textContent()).toContain('No data found')
      }else {
        expect(cellValue).toEqual(age);
      }
    }
  }
})

test('datepicker', async({page}) => {
  await page.getByText('Forms').click();
  await page.getByText('Datepicker').click();

  const calendarInputField = page.getByPlaceholder('Form Picker');
  await calendarInputField.click();

  let date = new Date();
  date.setDate(date.getDate() + 100);
  const expectedDate = date.getDate().toString();
  const expectedMonthShot = date.toLocaleString('En-US', {month: "short"});
  const expectedMonthLong = date.toLocaleString('En-US', {month: "long"});
  const expectedYear = date.getFullYear();
  const dateToAssert = `${expectedMonthShot} ${expectedDate}, ${expectedYear}`;

  let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent();
  const expectedMonthAndYear = ` ${expectedMonthLong} ${expectedYear} `;
  while(!calendarMonthAndYear.includes(expectedMonthAndYear)){
    await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click();
    calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent();
  }

  //not all 1, but only 1st
  await page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, {exact: true}).click();
  await expect(calendarInputField).toHaveValue(dateToAssert);
})

test('sliders', async({page}) => {
  // //update attribute
  // const tempGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle');
  // await tempGauge.evaluate( node => {
  //   node.setAttribute('cx', '232.630');
  //   node.setAttribute('cy', '232.630');
  // })
  // await tempGauge.click();

  //mouse movement
  const tempBox = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger');
  await tempBox.scrollIntoViewIfNeeded();

  const box = await tempBox.boundingBox();
  //found coordinates of box center
  const x = box.x + box.width/2;
  const y = box.y + box.height/2;
  //move mouse to the strating point
  await page.mouse.move(x, y);
  //simmulates left click by mouse
  await page.mouse.down();
  //move mouse horizontaly
  await page.mouse.move(x+100, y);
  //move mouse down
  await page.mouse.move(x+100, y+250);
  //release mouse
  await page.mouse.up();

  await expect(tempBox).toContainText('30');
})




