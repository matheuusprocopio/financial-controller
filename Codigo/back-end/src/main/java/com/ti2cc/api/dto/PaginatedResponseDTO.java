package com.ti2cc.api.dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PaginatedResponseDTO<T> {

    private final List<T> data;
    private final long totalItems;
    private final int currentPage;
    private final int pageLimit;

    public PaginatedResponseDTO(List<T> data, long totalItems, int currentPage, int pageLimit) {
        this.data = data == null ? new ArrayList<>() : new ArrayList<>(data);
        this.totalItems = totalItems;
        this.currentPage = currentPage;
        this.pageLimit = pageLimit;
    }

    public List<T> getData() {
        return Collections.unmodifiableList(data);
    }

    public long getTotalItems() {
        return totalItems;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public int getPageLimit() {
        return pageLimit;
    }
}
