package com.ti2cc.api.dto;

public class PaginationRequestDTO {

    public static final int DEFAULT_PAGE = 1;
    public static final int DEFAULT_PAGE_LIMIT = 20;

    private final int page;
    private final int pageLimit;

    public PaginationRequestDTO(int page, int pageLimit) {
        this.page = page > 0 ? page : DEFAULT_PAGE;
        this.pageLimit = pageLimit > 0 ? pageLimit : DEFAULT_PAGE_LIMIT;
    }

    public int getPage() {
        return page;
    }

    public int getPageLimit() {
        return pageLimit;
    }

    public int getOffset() {
        return (page - 1) * pageLimit;
    }
}
