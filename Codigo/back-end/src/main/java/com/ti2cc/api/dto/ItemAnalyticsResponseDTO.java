package com.ti2cc.api.dto;

import java.util.List;

public class ItemAnalyticsResponseDTO {

    private String metric;
    private String[] groupBy;
    private List<ItemAnalyticsPointDTO> points;

    public String getMetric() {
        return metric;
    }

    public void setMetric(String metric) {
        this.metric = metric;
    }

    public String[] getGroupBy() {
        return groupBy;
    }

    public void setGroupBy(String[] groupBy) {
        this.groupBy = groupBy;
    }

    public List<ItemAnalyticsPointDTO> getPoints() {
        return points;
    }

    public void setPoints(List<ItemAnalyticsPointDTO> points) {
        this.points = points;
    }
}
