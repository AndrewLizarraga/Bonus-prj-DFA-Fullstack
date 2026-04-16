const NODE_RADIUS = 30;
const PADDING = 20;
export function createDfaRenderer(canvas) {
    const ctx = canvas.getContext('2d');

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function computeCircularLayout(stateIds) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2+20;
        const layoutRadius = Math.min(canvas.width, canvas.height) * 0.35 - PADDING;
        const positions = {};

        stateIds.forEach((stateId, i) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * i) / stateIds.length;
            const x = cx + layoutRadius * Math.cos(angle);
            const y = cy + layoutRadius * Math.sin(angle);
            positions[stateId] = { x, y };
        });

        return positions;
    }

    function groupTransitions(transitions) {
        const grouped = new Map();

        transitions.forEach((t) => {
            const key = `${t.from}->${t.to}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    from: t.from,
                    to: t.to,
                    labels: [],
                });
            }

            grouped.get(key).labels.push(t.label);
        });

        return Array.from(grouped.values()).map((t) => ({
            from: t.from,
            to: t.to,
            label: t.labels.join(','),
        }));
    }

    function drawStartArrow(position) {
        const startX = position.x - 75;
        const startY = position.y;
        const endX = position.x - NODE_RADIUS;

        // Draw shaft of the start arrow toward the state.
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, startY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // Draw triangular arrow head.
        ctx.beginPath();
        ctx.moveTo(endX, startY);
        ctx.lineTo(endX - 10, startY - 6);
        ctx.lineTo(endX - 10, startY + 6);
        ctx.closePath();
        ctx.fillStyle = 'black';
        ctx.fill();
    }

    function drawState(stateId, position, options = {}) {
        const {
            isAccept = false,
            isStart = false,
            isActive = false,
            isAccepted = false,
            isRejected = false,
        } = options;

        let fillColor = 'white';
        let strokeColor = 'black';
        let lineWidth = 2;

        // Priority: rejected > accepted > active > default.
        if (isRejected) {
            fillColor = '#fee2e2';
            strokeColor = '#dc2626';
            lineWidth = 4;
        } else if (isAccepted) {
            fillColor = '#dcfce7';
            strokeColor = '#16a34a';
            lineWidth = 4;
        } else if (isActive) {
            fillColor = '#dbeafe';
            strokeColor = '#2563eb';
            lineWidth = 4;
        }

        ctx.beginPath();
        ctx.arc(position.x, position.y, NODE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        if (isAccept) {
            ctx.beginPath();
            ctx.arc(position.x, position.y, NODE_RADIUS - 6, 0, 2 * Math.PI);
            ctx.strokeStyle = isRejected ? '#dc2626' : isAccepted ? '#16a34a' : 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (isStart) {
            drawStartArrow(position);
        }

        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stateId, position.x, position.y);
    }

    function drawSelfLoop(position, label, isActive = false) {
        const loopRadius = 20;
        const loopCenterX = position.x;
        const loopCenterY = position.y - NODE_RADIUS - 18;

        const startAngle = 0.3;
        const endAngle = Math.PI * 1.7;

        ctx.beginPath();
        ctx.arc(loopCenterX, loopCenterY, loopRadius, loopRadius, startAngle,endAngle );
        ctx.lineWidth = isActive ? 4 : 2;
        ctx.strokeStyle = isActive ? '#2563eb' : '#374151';
        ctx.stroke();

        //arow head near the end of the loop
        const arrowX = loopCenterX + loopRadius * Math.cos(endAngle);
        const arrowY = loopCenterY + loopRadius * Math.sin(endAngle);
        const arrowAngle = endAngle + Math.PI / 2;
        drawArrowHead(arrowX, arrowY, arrowAngle, isActive);



        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? '#2563eb' : '#111827';
        ctx.fillText(label, loopCenterX, loopCenterY - loopRadius - 10);
    }

    function drawArrowHead(x, y, angle, isActive = false) {
        const size = 10;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - size * Math.cos(angle - Math.PI / 6),
            y - size * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x - size * Math.cos(angle + Math.PI / 6),
            y - size * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = isActive ? '#2563eb' : '#374151';
        ctx.fill();
    }

    function drawStraightEdge(fromPos, toPos, label, isActive = false) {
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const angle = Math.atan2(dy, dx);

        const startX = fromPos.x + NODE_RADIUS * Math.cos(angle);
        const startY = fromPos.y + NODE_RADIUS * Math.sin(angle);
        const endX = toPos.x - NODE_RADIUS * Math.cos(angle);
        const endY = toPos.y - NODE_RADIUS * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = isActive ? 4 : 2;
        ctx.strokeStyle = isActive ? '#2563eb' : '#374151';
        ctx.stroke();

        drawArrowHead(endX, endY, angle, isActive);

        const labelX = (startX + endX) / 2;
        const labelY = (startY + endY) / 2 - 10;

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? '#2563eb' : '#111827';
        ctx.fillText(label, labelX, labelY);
    }

    function drawCurvedEdge(fromPos, toPos, label, curveDirection = 1, isActive = false) {
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;

        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const len = Math.hypot(dx, dy) || 1;

        const nx = -dy / len;
        const ny = dx / len;

        // Larger mirrored offset keeps reverse-direction edges visibly separated.
        const curveAmount = 75 * curveDirection;
        const controlX = midX + nx * curveAmount;
        const controlY = midY + ny * curveAmount;

        const startAngle = Math.atan2(controlY - fromPos.y, controlX - fromPos.x);
        const endAngle = Math.atan2(toPos.y - controlY, toPos.x - controlX);

        const startX = fromPos.x + NODE_RADIUS * Math.cos(startAngle);
        const startY = fromPos.y + NODE_RADIUS * Math.sin(startAngle);
        const endX = toPos.x - NODE_RADIUS * Math.cos(endAngle);
        const endY = toPos.y - NODE_RADIUS * Math.sin(endAngle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.lineWidth = isActive ? 4 : 2;
        ctx.strokeStyle = isActive ? '#2563eb' : '#374151';
        ctx.stroke();

        drawArrowHead(endX, endY, endAngle, isActive);

        // Place labels farther from the center line so reverse-edge labels do not overlap.
        const curvePointX = 0.25 * startX + 0.5 * controlX + 0.25 * endX;
        const curvePointY = 0.25 * startY + 0.5 * controlY + 0.25 * endY;
        const labelX = curvePointX + nx * 14 * curveDirection;
        const labelY = curvePointY + ny * 14 * curveDirection;

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? '#2563eb' : '#111827';
        ctx.fillText(label, labelX, labelY);
    }

    function getEdgePairKey(edge) {
        return [edge.from, edge.to].sort().join('<->');
    }

    
    
    function render(dfa, highlight = {}) {
        clear();

        // Guard malformed input to prevent canvas render crashes and make debugging easier.
        if (!dfa || typeof dfa !== 'object') {
            console.error('Renderer: missing or invalid dfa object', dfa);
            return;
        }

        const {
            states = [],
            start_state,
            accept_states = [],
            transitions = [],
        } = dfa;

        if (!Array.isArray(states) || states.length === 0) {
            console.error('Renderer: invalid or empty states array', dfa);
            return;
        }

        if (!Array.isArray(transitions)) {
            console.error('Renderer: invalid transitions array', dfa);
            return;
        }

        if (!Array.isArray(accept_states)) {
            console.error('Renderer: invalid accept_states array', dfa);
            return;
        }

        const positions = computeCircularLayout(states);
        const groupedEdges = groupTransitions(transitions);

        const processedReversePairs = new Set();

groupedEdges.forEach((edge) => {
    if (!positions[edge.from] || !positions[edge.to]) {
        console.error('Renderer: missing state position for edge', edge, positions);
        return;
    }

    if (edge.from === edge.to) {
        const isActive =
            highlight.activeTransition &&
            highlight.activeTransition.from === edge.from &&
            highlight.activeTransition.to === edge.to;

        drawSelfLoop(positions[edge.from], edge.label, isActive);
        return;
    }

    const reverseEdge = groupedEdges.find(
        (other) =>
            other.from === edge.to &&
            other.to === edge.from &&
            other.from !== other.to
    );

    if (reverseEdge) {
        const pairKey = getEdgePairKey(edge);

        if (processedReversePairs.has(pairKey)) {
            return;
        }

        processedReversePairs.add(pairKey);

        const [edgeAbove, edgeBelow] =
            edge.from < edge.to ? [edge, reverseEdge] : [reverseEdge, edge];

        const aboveIsActive =
            highlight.activeTransition &&
            highlight.activeTransition.from === edgeAbove.from &&
            highlight.activeTransition.to === edgeAbove.to;

        const belowIsActive =
            highlight.activeTransition &&
            highlight.activeTransition.from === edgeBelow.from &&
            highlight.activeTransition.to === edgeBelow.to;

        drawCurvedEdge(
            positions[edgeAbove.from],
            positions[edgeAbove.to],
            edgeAbove.label,
            1,
            aboveIsActive
        );

        drawCurvedEdge(
            positions[edgeBelow.from],
            positions[edgeBelow.to],
            edgeBelow.label,
            1,
            belowIsActive
        );

        return;
    }

    const isActive =
        highlight.activeTransition &&
        highlight.activeTransition.from === edge.from &&
        highlight.activeTransition.to === edge.to;

    drawStraightEdge(
        positions[edge.from],
        positions[edge.to],
        edge.label,
        isActive
    );
});

        states.forEach((stateId) => {
            // Skip unknown nodes to keep rendering resilient with incomplete state arrays.
            if (!positions[stateId]) {
                console.error('Renderer: missing position for state', stateId);
                return;
            }

            drawState(stateId, positions[stateId], {
                isStart: stateId === start_state,
                isAccept: accept_states.includes(stateId),
                isActive: highlight.activeState === stateId,
                isAccepted: highlight.acceptedState === stateId,
                isRejected: highlight.rejectedState === stateId,
            });
        });
    }

    

    return {
        render,
    };
}

export const createDfARenderer = createDfaRenderer;
