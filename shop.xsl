<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <link rel="stylesheet" href="styles.css" />
        <title>Shop Data</title>
      </head>

      <body>
        <div class="card-container">
          <xsl:for-each select="shop/product">
            <div class="card">
              <xsl:attribute name="class">
                <xsl:text>card</xsl:text>
                <xsl:if test="in_stock='false'">
                  <xsl:text> disabled</xsl:text>
                </xsl:if>
              </xsl:attribute>

              <xsl:if test="in_stock='false'">
                <p class="out-of-stock">Out of Stock</p>
              </xsl:if>

              <img
                src="{image_url}"
                alt="Product Image"
                class="product-image"
                loading="lazy"
              />
              <xsl:if test="previous_price">
                <span class="discount">
                  <xsl:value-of
                    select="format-number(100 - (price div previous_price * 100), '0')"
                  />%
                </span>
              </xsl:if>

              <div class="card-content">
                <h2 class="product-name">
                  <xsl:value-of select="name" />
                </h2>

                <div class="compact-row">
                  <p class="brand">
                    <strong>Brand:</strong> <xsl:value-of select="brand" />
                  </p>
                  <p class="qty">
                    <strong>Qty:</strong> <xsl:value-of select="quantity" />
                  </p>
                </div>

                <p class="price">
                  <xsl:choose>
                    <xsl:when test="previous_price">
                      <span>$<xsl:value-of select="price" /></span>
                    </xsl:when>
                    <xsl:otherwise>
                      <span class="no-discount"
                        >$<xsl:value-of select="price"
                      /></span>
                    </xsl:otherwise>
                  </xsl:choose>
                  <xsl:if test="previous_price">
                    <span class="previous-price"
                      >$<xsl:value-of select="previous_price"
                    /></span>
                  </xsl:if>
                </p>

                <p class="category">
                  <strong>Category:</strong> <xsl:value-of select="category" />
                  <xsl:if test="subcategory">
                    / <xsl:value-of select="subcategory"
                  /></xsl:if>
                </p>
                <p class="material">
                  <strong>Material:</strong> <xsl:value-of select="material" />
                </p>

                <div class="colors">
                  <xsl:for-each select="colors/color[position() &lt;= 4]">
                    <span
                      class="color-box"
                      style="background-color: {normalize-space(.)};"
                    ></span>
                  </xsl:for-each>
                  <xsl:if test="count(colors/color) &gt; 4">
                    <span class="color-box more-colors"
                      >+<xsl:value-of select="count(colors/color) - 4"
                    /></span>
                  </xsl:if>
                </div>

                <div class="sizes">
                  <strong>Sizes:</strong>
                  <xsl:for-each select="sizes/size">
                    <span><xsl:value-of select="." /></span>
                  </xsl:for-each>
                </div>

                <div class="tags">
                  <strong>Tags:</strong>
                  <xsl:for-each select="tags/tag">
                    <span class="tag"><xsl:value-of select="." /></span>
                  </xsl:for-each>
                </div>

                <p class="rating">
                  ⭐<xsl:value-of select="rating/@average" /> (<xsl:value-of
                    select="rating/reviews"
                  />)
                </p>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
