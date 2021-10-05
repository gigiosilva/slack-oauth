import { Component } from '@angular/core';
import { AppService } from './app.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'slack-front';
  windowObjectReference: any;
  previousUrl: any;
  user: any;

  constructor(private appService: AppService) {}

  loginSlack() {
    const clientId = 'add-client-id-here';
    const scope = 'openid%20profile%20email';
    const url = `https://slack.com/openid/connect/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${window.location.origin}`;

    this.openSignInWindow(url, 'Slack Auth');
  }

  openSignInWindow(url: any, name: any) {
    // remove any listener
    window.removeEventListener('message', this.registerAuth);

    // window features
    const width = 600;
    const height = 700;
    const left = (screen.width/2)-(width/2);
    const top = (screen.height/2)-(height/2);
    const strWindowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;

    if (this.windowObjectReference === null || this.windowObjectReference?.closed) {
      /* if the pointer to the window object in memory does not exist
      or if such pointer exists but the window was closed */
      this.windowObjectReference = window.open(url, name, strWindowFeatures);
    } else if (this.previousUrl !== url) {
      /* if the resource to load is different,
      then we load it in the already opened secondary window and then
      we bring such window back on top/in front of its parent window. */
      this.windowObjectReference = window.open(url, name, strWindowFeatures);
      this.windowObjectReference.focus();
    } else {
      /* else the window reference must exist and the window
      is not closed; therefore, we can bring it back on top of any other
      window with the focus() method. There would be no need to re-create
      the window or to reload the referenced resource. */
      this.windowObjectReference.focus();
    }

    // add the listener for receiving a message from the popup
    window.addEventListener('message', () => this.registerAuth(), false);

    // assign the previous URL
    this.previousUrl = url;
  };

  async registerAuth() {
    try {
      const href = this.windowObjectReference?.location.href;

      if (href && href.match('code')) {
        console.log(href);
        
        const code :string = this.getQueryString('code', href) ?? '';
        this.windowObjectReference.close();

        console.log(code);

        const authResponsed: any = await this.appService.generateToken(code).toPromise();
        const jwtToken = authResponsed.id_token;

        console.log(authResponsed);

        if (jwtToken) {
          this.user = jwt_decode(jwtToken);
          console.log(this.user);
        }
      }
    } catch (error) {}
  }

  createOauthWindow(url: string, name = 'Authorization', width = 500, height = 600, left = 0, top = 0) {
    if (url == null) {
        return null;
    }
    const options = `width=${width},height=${height},left=${left},top=${top}`;
    return window.open(url, name, options);
  }

  getQueryString(field: any, url: string) {
    const windowLocationUrl = url;
    const reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    const string = reg.exec(windowLocationUrl);
    return string ? string[1] : null;
  };
}
