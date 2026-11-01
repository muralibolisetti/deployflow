import * as React from 'react';
import {Page} from '../../shared/components';

require('./help.scss');

const REPO_DOCS = 'https://github.com/muralibolisetti/deployflow/blob/deployflow-dev';

export const Help = () => (
    <Page title='Help'>
        <div className='row'>
            <div className='columns large-4 small-6'>
                <div className='help-box'>
                    <p>New to DeployFlow?</p>
                    <a className='user-info-panel-buttons argo-button argo-button--base' href={`${REPO_DOCS}/README.md`} target='_blank' rel='noreferrer'>
                        Read the guide
                    </a>
                </div>
            </div>
            <div className='columns large-4 small-6'>
                <div className='help-box'>
                    <p>Running a demonstration?</p>
                    <a className='user-info-panel-buttons argo-button argo-button--base' href={`${REPO_DOCS}/docs/demo-guide.md`} target='_blank' rel='noreferrer'>
                        Open the demo guide
                    </a>
                </div>
            </div>
            <div className='columns large-4 small-6'>
                <div className='help-box'>
                    <p>Want to see how it works?</p>
                    <a className='user-info-panel-buttons argo-button argo-button--base' href={`${REPO_DOCS}/docs/architecture.md`} target='_blank' rel='noreferrer'>
                        Open the architecture
                    </a>
                </div>
            </div>
        </div>
    </Page>
);
