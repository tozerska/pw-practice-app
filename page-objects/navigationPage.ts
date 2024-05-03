import { Locator, Page } from '@playwright/test';
import { HelperBase } from './helperBase';

export class NavigationPage extends HelperBase{

  readonly formLayoutsMenuItem: Locator;

  constructor(page: Page) {
    super(page);
    this.formLayoutsMenuItem = page.getByText('Form Layouts');
  }

  async formLayoutPage(){
    await this.selectGroupMenuItem('Forms');
    await this.formLayoutsMenuItem.click();
    await this.waitForNumberOfSeconds(2);
  }

  async datepickerPage() {
    await this.selectGroupMenuItem('Forms');
    await this.page.getByText('Datepicker').click();
  }

  async smartTablePage() {
    await this.selectGroupMenuItem('Tables & Data');
    await this.page.getByText('Smart Table').click();
  }

  async toastrPage() {
    await this.selectGroupMenuItem('Modal & Overlays');
    await this.page.getByText('Toastr').click();
  }

  async tolltipPage() {
    await this.selectGroupMenuItem('Modal & Overlays');
    await this.page.getByText('Tooltip').click();
  }

  private async selectGroupMenuItem(groupItemTitle: string) {
    const groupMenuItem = this.page.getByTitle(groupItemTitle);
    const expandedState = groupMenuItem.getAttribute('aria-expanded');
    if(await expandedState == "false")
      await groupMenuItem.click();
  }
}
