<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


defineOptions({ name: 'Home' })


</script>

<template>

    <div className="overview-content">
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="org-info">
                    <CardTitle className="text-2xl font-bold">rcchronos</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Organization overview</p>
                </div>
                <div className="org-actions flex gap-2">
                    <Button>
                        New Playground
                        <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </Button>
                    <Button>+ New app</Button>
                    <Button>+ New Sandbox</Button>
                </div>
            </CardHeader>
        </Card>

        <div className="usage-section mb-6">
            <div className="section-header mb-4">
                <h2 className="section-title text-xl font-semibold">Usage</h2>
                <span className="section-subtitle text-sm text-muted-foreground">- started today</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="text-sm text-muted-foreground mb-1">Requests</div>
                        <div className="text-2xl font-bold">0M</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">⚙️</div>
                        <div className="text-sm text-muted-foreground mb-1">CPU Time</div>
                        <div className="text-2xl font-bold">0h</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">📤</div>
                        <div className="text-sm text-muted-foreground mb-1">Outbound</div>
                        <div className="text-2xl font-bold">0GiB</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">📥</div>
                        <div className="text-sm text-muted-foreground mb-1">Inbound</div>
                        <div className="text-2xl font-bold">0GiB</div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="apps-section mb-6">
            <div className="section-header mb-4">
                <h2 className="section-title text-xl font-semibold">Applications</h2>
                <span className="section-subtitle text-sm text-muted-foreground">- Your deployed apps and
                    playgrounds</span>
            </div>
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div className="app-item-name font-medium">kind-shrimp-21</div>
                        <div className="app-item-status">
                            <div className="status-indicator">
                                <div className="status-dot h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="sandboxes-section">
            <div className="section-header mb-4">
                <h2 className="section-title text-xl font-semibold">Sandboxes</h2>
                <span className="section-subtitle text-sm text-muted-foreground">- Isolated execution environments for
                    running code</span>
            </div>
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="empty-text text-lg mb-2">No sandboxes yet</div>
                    <div className="empty-subtext text-sm text-muted-foreground mb-4">Sandboxes require a verified
                        organization.</div>
                    <Button>Verify Organization</Button>
                </CardContent>
            </Card>
        </div>
    </div>

</template>

<style scoped lang="scss">
.overview-content {
    // width: 1200px;
}
</style>
