import * as React from 'react';
import {Link} from 'react-router-dom';

import * as models from '../../../shared/models';
import requests from '../../../shared/services/requests';

import './deployment-overview.scss';

const REFRESH_INTERVAL_MS = 5000;
const RECENT_LIMIT = 5;

interface Activity {
    key: string;
    app: string;
    revision: string;
    time: string;
    actor: string;
    outcome: 'Deployed' | 'Failed';
}

function isFailing(app: models.Application) {
    const phase = app.status.operationState?.phase;
    return app.status.health?.status === 'Degraded' || phase === 'Failed' || phase === 'Error';
}

function getActivity(apps: models.Application[]): Activity[] {
    const activity: Activity[] = [];
    apps.forEach(app => {
        (app.status.history || []).forEach(entry => {
            activity.push({
                key: `${app.metadata.name}-${entry.id}`,
                app: app.metadata.name,
                revision: entry.revision,
                time: entry.deployedAt,
                actor: entry.initiatedBy?.automated ? 'Auto-sync' : entry.initiatedBy?.username || 'Unknown',
                outcome: 'Deployed'
            });
        });

        // The engine keeps only successful syncs in history, so the latest failure comes from the operation state.
        const operation = app.status.operationState;
        if (operation && (operation.phase === 'Failed' || operation.phase === 'Error')) {
            activity.push({
                key: `${app.metadata.name}-failed-${operation.startedAt}`,
                app: app.metadata.name,
                revision: operation.syncResult?.revision || operation.operation?.sync?.revision || '',
                time: operation.finishedAt || operation.startedAt,
                actor: operation.operation?.initiatedBy?.automated ? 'Auto-sync' : operation.operation?.initiatedBy?.username || 'Unknown',
                outcome: 'Failed'
            });
        }
    });
    return activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, RECENT_LIMIT);
}

function formatTime(value: string) {
    return new Date(value).toLocaleString(undefined, {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
}

const Stat = ({label, value, tone}: {label: string; value: number; tone?: string}) => (
    <div className='deployment-overview__stat'>
        <span className={`deployment-overview__value ${value > 0 && tone ? `deployment-overview__value--${tone}` : ''}`}>{value}</span>
        <span className='deployment-overview__label'>{label}</span>
    </div>
);

export const DeploymentOverview = () => {
    const [apps, setApps] = React.useState<models.Application[]>(null);
    const [failed, setFailed] = React.useState(false);

    React.useEffect(() => {
        const load = () => {
            if (document.hidden) {
                return;
            }
            requests
                .get('/applications')
                .then(res => {
                    setApps(res.body.items || []);
                    setFailed(false);
                })
                .catch(() => setFailed(true));
        };
        load();
        const timer = setInterval(load, REFRESH_INTERVAL_MS);
        document.addEventListener('visibilitychange', load);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', load);
        };
    }, []);

    if (failed && !apps) {
        return <div className='deployment-overview__notice'>Overview is unavailable right now. Check the connection to the server.</div>;
    }
    if (!apps) {
        return null;
    }

    const activity = getActivity(apps);

    return (
        <section className='deployment-overview' aria-label='Deployment overview'>
            <div className='deployment-overview__stats'>
                <Stat label='Applications' value={apps.length} />
                <Stat label='Healthy' value={apps.filter(app => app.status.health?.status === 'Healthy').length} tone='good' />
                <Stat label='Out of sync' value={apps.filter(app => app.status.sync?.status === 'OutOfSync').length} tone='warn' />
                <Stat label='Failed or degraded' value={apps.filter(isFailing).length} tone='bad' />
            </div>
            <div className='deployment-overview__recent'>
                <h6>Recent deployments</h6>
                {activity.length === 0 && <p>Nothing has been deployed yet.</p>}
                {activity.map(item => (
                    <div className='deployment-overview__row' key={item.key}>
                        <span className={`deployment-overview__dot deployment-overview__dot--${item.outcome.toLowerCase()}`} title={item.outcome} />
                        <Link to={`/applications/${item.app}`}>{item.app}</Link>
                        <code>{item.revision.substring(0, 7)}</code>
                        <span className='deployment-overview__meta'>
                            {item.outcome} by {item.actor}
                        </span>
                        <span className='deployment-overview__time'>{formatTime(item.time)}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};
